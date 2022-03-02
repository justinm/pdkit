import { spawn } from "child_process";
import path from "path";
import { Project, Workspace, InstallShellScript, Script, ShellScript } from "@pdkit/core";
import prompts from "prompts";
import yargs from "yargs";
import { AppArguments } from "../pdkit";
import { loadWorkspace, spinner, synthWorkspace, withSpinner } from "../utils";

export const command = "synth";
export const desc = "Synthesizes the projects configuration";

export const builder: yargs.CommandBuilder<any, any> = function (y) {
  return y
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

const runShellScripts = async (
  workspace: Workspace | null,
  name: string,
  type: typeof ShellScript,
  verbose: number,
  dryrun: boolean
) => {
  return withSpinner(verbose, `Running ${name} shell scripts`, async () => {
    if (workspace) {
      const scripts = workspace.node
        .findAll()
        .filter((b) => b instanceof Project)
        .map((p) => p.node.findAll().filter((b) => b instanceof type))
        .flat() as ShellScript[];
      const rootPath = workspace.rootPath;

      if (!scripts.length) {
        throw `No ${name} scripts were found`;
      }

      for (const script of scripts) {
        const cmd = script.command;

        if (cmd) {
          const pcwd = path.join(rootPath, Project.of(script).projectPath);
          if (dryrun) {
            spinner.info(`  Would run ${name} script: ${cmd} in ${pcwd}`);
            continue;
          }

          if (verbose) {
            spinner.start(`  Running ${name} script: ${cmd}`);
          }

          script._beforeExecute();

          const proc = spawn(cmd[0], cmd.slice(1), {
            cwd: pcwd,
            env: process.env,
          });

          await new Promise((resolve, reject) => {
            const lines: Buffer[] = [];
            proc.stdout.on("data", (data) => {
              if (data) {
                lines.push(data);
              }
            });
            proc.on("close", (code) => {
              if (!code) {
                if (verbose) {
                  spinner.succeed();
                }
                resolve(true);
              } else {
                if (verbose) {
                  spinner.fail();
                }
                lines.forEach((line) => console.log(line.toString().trim()));

                reject(`"${command}" returned exit code ${code}`);
              }
            });
          });

          script._afterExecute();
        }

        if (dryrun && !verbose) {
          throw "No tasks were executed";
        }
      }
    }
  });
};

const writeFilesToDisk = async (workspace: Workspace, verbose: number, dryRun: boolean) => {
  await withSpinner(verbose, "Writing files to disk", async () => {
    const results = workspace.syncFilesToDisk({ dryRun });

    for (const result of results) {
      if (result.reason) {
        spinner.warn(`  ${result}: ${result.reason}`);

        if (!dryRun) {
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

          if (answer.confirm) {
            const again = workspace.syncFilesToDisk({ dryRun, forcePath: result.path });

            if (again[0].reason) {
              spinner.fail(`  ${result.path}: ${again[0].reason}`);
            }
          }
        }
      } else {
        if (verbose) {
          if (!dryRun) {
            spinner.succeed(`  ${result.path}: written successfully`);
          } else {
            spinner.info(`  ${result.path}: would write file`);
          }
        }
      }
    }

    if (dryRun && !verbose) {
      throw "no files were written";
    }
  });
};

export const handler = async function (argv: AppArguments) {
  const config = argv.config as string;
  const dryRun = (argv.dryrun as boolean) ?? false;
  const verbose = (argv.verbose as number) ?? false;
  const workspace = await loadWorkspace(config);

  synthWorkspace(workspace);

  await writeFilesToDisk(workspace, verbose, dryRun);
  await runShellScripts(workspace, "install", InstallShellScript, verbose, dryRun);
  await workspace.runScripts(Script);

  if (!verbose && dryRun) {
    spinner.info("For more information, try the --verbose flag and/or LOG_LEVEL=debug");
  }

  spinner.succeed("Done");
};
