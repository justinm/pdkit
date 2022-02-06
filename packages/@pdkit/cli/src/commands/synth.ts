import yargs from "yargs";
import { AppArguments } from "../pdkit";
import path from "path";
import { VirtualFS } from "../../../core/src/constructs/VirtualFS";
import prompts from "prompts";
import ora from "ora";
import logger from "../../../core/src/util/logger";
import { Workspace } from "../../../core/src";
import assert from "assert";

export const command = "synth";
export const desc = "Synthesizes the projects configuration";

interface Args extends AppArguments {}

export const builder: yargs.CommandBuilder<any, any> = function (yargs) {
  return yargs
    .option("dryrun", {
      alias: "n",
      type: "boolean",
    })
    .option("verbose", {
      alias: "v",
      type: "count",
      default: 0,
    });
};

async function withSpinner<T>(spinner: ora.Ora, message: string, callback: () => T | null) {
  const indent = spinner.indent;
  try {
    spinner.start(`${message}... `);
    const ret = await callback();
    spinner.indent = indent;
    spinner.succeed(`${message}... complete!`);

    return ret;
  } catch (err) {
    spinner.indent = indent;

    if (err instanceof Error) {
      spinner.fail(`${message}... ${(err as Error).message}`);
      process.exit(1);
    } else {
      spinner.warn(`${message}... ${err as string}`);
    }
  }

  return null;
}

export const handler = async function (argv: Args) {
  const config = argv.config as string;
  const dryrun = (argv.dryrun as boolean) ?? false;
  const verbose = (argv.verbose as number) ?? false;

  const spinner = ora();

  let workspace = await withSpinner<Workspace>(spinner, "Loading project...", () => {
    process.chdir(path.dirname(config));

    return require(config).workspace as Workspace;
  });

  assert(workspace);

  await withSpinner(spinner, "Synthesizing project...", () => {
    if (workspace) {
      workspace.synth();
    }
  });

  spinner.start();

  await withSpinner(spinner, "Writing files to disk", async () => {
    const vfs = VirtualFS.of(workspace);
    const filesWritten: string[] = [];

    if (verbose) {
      spinner.info("Writing files to disk...");
    }

    spinner.indent = 2;

    for (const filePath of vfs.files) {
      if (verbose) {
        spinner.start(`Writing file ${filePath}`);
      }

      const conflict = vfs.checkPathConflicts(filePath);
      let skip = false;

      if (conflict) {
        spinner.warn(`${filePath}: ${conflict}`);
        const answer = await prompts(
          {
            name: "confirm",
            message: "Do you wish to overwrite this file?",
            type: "confirm",
          },
          {
            onCancel: () => {
              process.exit(1);
            },
          }
        );

        skip = answer.confirm;
      }

      if (!skip) {
        filesWritten.push(filePath);

        if (!dryrun) {
          try {
            vfs.syncPathToDisk(filePath);

            if (verbose) {
              spinner.succeed(`${filePath}: written successfully`);
            }
          } catch (err) {
            logger.error((err as Error).stack);
            spinner.fail(`${filePath}: file write failure`);
          }
        } else {
          if (verbose) {
            spinner.warn(`${filePath}: would be written`);
          }
        }
      } else {
        if (verbose) {
          spinner.fail(`${filePath}: file was skipped`);
        }
      }
    }

    if (!filesWritten.length) {
      throw "Project synthesis failed: No files were written";
    }

    if (dryrun) {
      throw "no files were written";
    }
  });
};
