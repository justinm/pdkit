import yargs from "yargs";
import { AppArguments } from "../pdkit";
import path from "path";
import { VirtualFS } from "../../../core/src/constructs/VirtualFS";
import prompts from "prompts";
import ora from "ora";
import logger from "../../../core/src/util/logger";
import { ConstructError, Project, Workspace, XConstruct } from "../../../core/src";
import { spawn } from "child_process";
import { Script } from "../../../core/src/scripts/Script";
import { InstallScript } from "../../../core/src/scripts/InstallScript";
import { PostInstallScript } from "../../../core/src/scripts/PostInstallScript";

export const command = "synth";
export const desc = "Synthesizes the projects configuration";

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

async function withSpinner<T>(spinner: ora.Ora, verbose: number, message: string, callback: () => T | null) {
  const indent = spinner.indent;
  try {
    if (verbose) {
      spinner.info(`${message}...`);
    } else {
      spinner.start(`${message}...`);
    }
    const ret = await callback();
    spinner.indent = indent;

    if (spinner.isSpinning) {
      spinner.succeed(`${message}... complete`);
    }

    return ret;
  } catch (err) {
    spinner.indent = indent;

    if (err instanceof ConstructError) {
      spinner.fail(`${message}: ${(err as Error).message}`);
      logger.debug(err.stack);
      process.exit(1);
    }

    if (err instanceof Error) {
      spinner.fail(`${message}: ${(err as Error).message}`);
      process.exit(1);
    } else {
      spinner.warn(`${message}: ${err as string}`);
    }
  }

  return null;
}

export const handler = async function (argv: AppArguments) {
  const config = argv.config as string;
  const dryrun = (argv.dryrun as boolean) ?? false;
  const verbose = (argv.verbose as number) ?? false;

  const spinner = ora();

  let workspace = await withSpinner<Workspace>(spinner, 0, "Loading project...", () => {
    process.chdir(path.dirname(config));

    const ws = Workspace.of(require(config).default as XConstruct);

    if (!ws) {
      throw new Error("No workspace could be found for project.");
    }

    return ws;
  });

  await withSpinner(spinner, 0, "Synthesizing project...", () => {
    if (workspace) {
      workspace.synth();
    }
  });

  await withSpinner(spinner, verbose, "Writing files to disk", async () => {
    const vfs = VirtualFS.of(workspace);
    const filesWritten: string[] = [];

    for (const filePath of vfs.files) {
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
          if (verbose) {
            spinner.start(`  Writing file ${filePath}`);
          }

          try {
            vfs.syncPathToDisk(filePath);

            if (verbose) {
              spinner.succeed();
            }
          } catch (err) {
            logger.error((err as Error).stack);
            spinner.fail(`${filePath}: file write failure`);
            process.exit(1);
          }
        } else {
          if (verbose) {
            spinner.info(`  Would write file ${filePath}`);
          }
        }
      } else {
        if (verbose) {
          spinner.info(`${filePath}: file was skipped`);
        }
      }
    }

    if (!filesWritten.length) {
      throw "Project synthesis failed: No files were written";
    }

    if (dryrun && !verbose) {
      throw "no files were written";
    }
  });

  const runScripts = async (name: string, type: typeof Script) => {
    return withSpinner(spinner, verbose, `Running ${name} scripts`, async () => {
      if (workspace) {
        const scripts = workspace.binds
          .filter((b) => b instanceof Project)
          .map((p) => p.binds.filter((b) => b instanceof type))
          .flat() as Script[];
        const rootPath = workspace.rootPath;

        if (!scripts.length) {
          throw "No install scripts were found";
        }

        for (const script of scripts) {
          if (!dryrun) {
            script._beforeExecute();
          }

          if (script.commands) {
            for (const command of script.commands) {
              const pcwd = path.join(rootPath, Project.of(script).projectPath);
              if (dryrun) {
                spinner.info(`  Would run install script: ${command} in ${pcwd}`);
                continue;
              }

              if (verbose) {
                spinner.start(`  Running install script: ${command}`);
              }

              const proc = spawn(command, {
                cwd: pcwd,
                env: process.env,
              });

              await new Promise((resolve, reject) => {
                const lines: Buffer[] = [];
                proc.stdout.on("data", (data) => {
                  lines.push(data);
                });
                proc.on("close", (code) => {
                  if (!code) {
                    if (verbose) {
                      spinner.succeed();
                    }
                    resolve(true);
                  } else {
                    spinner.fail();
                    lines.forEach((line) => console.log(line.toString().trim()));

                    reject(`"${command}" returned exit code ${code}`);
                  }
                });
              });
            }
          }

          if (!dryrun) {
            script._afterExecute();
          }

          if (dryrun && !verbose) {
            throw "No tasks were executed";
          }
        }
      }
    });
  };

  await runScripts("install", InstallScript);
  await runScripts("post-install", PostInstallScript);

  if (!verbose && dryrun) {
    spinner.info("For more information, try the --verbose flag and/or LOG_LEVEL=debug");
  }
};
