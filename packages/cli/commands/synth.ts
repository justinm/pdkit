import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { Bindings, FileSynthesizer, InstallShellScript, Project, Script, ShellScript, Workspace } from "@stackgen/core";
import * as Diff from "diff";
import yargs from "yargs";
import { loadWorkspace, spinner, withSpinner } from "../utils";

export const command = "synth";
export const desc = "Synthesizes the projects configuration";

export const builder: yargs.CommandBuilder<any, any> = function (y) {
  return y
    .option("dryrun", {
      alias: "n",
      type: "boolean",
    })
    .option("force", {
      alias: "f",
      type: "boolean",
    })
    .option("verbose", {
      alias: "v",
      type: "count",
      default: 0,
    });
};

const runShellScripts = async (workspace: Workspace | null, name: string, type: typeof ShellScript, verbose: number, dryrun: boolean) => {
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

const writeFilesToDisk = async (workspace: Workspace, verbose: number, dryRun: boolean, _: boolean) => {
  await withSpinner(dryRun ? 1 : verbose, "Writing files to disk", async () => {
    const projects = Bindings.of(workspace).filterByClass(Project);
    for (const project of projects) {
      const fileSynthesizer = FileSynthesizer.of(project);

      for (const filePath of fileSynthesizer.virtualFiles) {
        if (fileSynthesizer.realFileIsDifferent(filePath)) {
          if (!dryRun) {
            fileSynthesizer.syncVFileToDisk(filePath);
            if (verbose) {
              spinner.succeed(`  ${filePath}: written successfully`);
            }
          } else {
            if (verbose || dryRun) {
              spinner.info(`  ${filePath}: would write`);
            }

            const realPath = path.join(fileSynthesizer.rootPath, filePath);

            if (verbose > 1 && fs.existsSync(realPath)) {
              console.log(
                Diff.createPatch(filePath, fs.readFileSync(realPath).toString("utf8"), fileSynthesizer.readVFile(filePath) as string)
              );
            }
          }
        } else {
          if (verbose || dryRun) {
            spinner.info(`  ${filePath}: skipping file, no differences`);
          }
        }
      }
    }
  });
};

export const handler = async function (argv: { config: string; dryrun: boolean; force: boolean; verbose: number }) {
  const config = argv.config as string;
  const dryRun = (argv.dryrun as boolean) ?? false;
  const force = (argv.force as boolean) ?? false;
  const verbose = (argv.verbose as number) ?? false;
  const workspace = await loadWorkspace(config);

  workspace.synth();

  await writeFilesToDisk(workspace, verbose, dryRun, force);
  await runShellScripts(workspace, "install", InstallShellScript, verbose, dryRun);
  await workspace.runScripts(Script);

  if (!verbose && dryRun) {
    spinner.info("For more information, try the --verbose flag and/or LOG_LEVEL=debug");
  }

  spinner.succeed("Done");
};
