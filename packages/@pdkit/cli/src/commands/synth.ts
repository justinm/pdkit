import yargs from "yargs";
import { AppArguments } from "../pdkit";
import path from "path";
import { VirtualFS } from "../../../core/src/constructs/VirtualFS";
import prompts from "prompts";
import ora from "ora";
import logger from "../../../core/src/util/logger";

export const command = "synth";
export const desc = "Synthesizes the projects configuration";

interface Args extends AppArguments {}

export const builder: yargs.CommandBuilder<any, any> = function (yargs) {
  return yargs.option("dryrun", {
    alias: "n",
    type: "boolean",
  });
};

export const handler = async function (argv: Args) {
  const config = argv.config as string;
  const dryrun = (argv.dryrun as boolean) ?? false;
  const spinner = ora("Synthesizing project...").start();

  process.chdir(path.dirname(config));

  const { workspace } = require(config);

  workspace.synth();

  spinner.succeed("Project synthesized");
  spinner.start("Writing files to disk");

  const vfs = VirtualFS.of(workspace);
  const filesWritten: string[] = [];

  for (const filePath of vfs.files) {
    spinner.start(`Writing file ${filePath}`);

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
      try {
        if (!dryrun) {
          vfs.syncPathToDisk(filePath);

          spinner.succeed(`${filePath}: written successfully`);
        } else {
          spinner.warn(`${filePath}: would be written`);
        }
      } catch (err) {
        logger.error((err as Error).stack);
        spinner.fail(`${filePath}: file write failure`);
      }
    } else {
      spinner.fail(`${filePath}: file was skipped`);
    }
  }

  if (!filesWritten.length) {
    spinner.fail("Project synthesis failed: No files were written");
  } else {
    spinner.succeed("Project synthesis complete!");
  }
};
