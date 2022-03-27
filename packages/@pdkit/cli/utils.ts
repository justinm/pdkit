import fs from "fs";
import path from "path";
import { ConstructError, IWorkspace, logger, Workspace, XConstruct } from "@pdkit/core";
import ora from "ora";

export const spinner = ora();

export function synthWorkspace(workspace: Workspace) {
  workspace.synth();
}

export async function loadWorkspace(configPath: string) {
  const workspace = await withSpinner<IWorkspace>(0, "Loading project...", () => {
    process.chdir(path.dirname(configPath));

    if (!fs.existsSync(configPath)) {
      throw new Error("No .pdkitrc.ts could be found");
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const ws = Workspace.of(require(configPath).default as XConstruct);

    if (!ws) {
      throw new Error("No workspace could be found for project.");
    }

    return ws;
  });

  return workspace as Workspace;
}

export function writeWithSpinner(text: string, stderr?: Boolean) {
  if (text && text !== "") {
    spinner.stop();
    process.stderr.write("\r");
    (stderr ? process.stderr : process.stdout).write(text.trimEnd() + "\n");
    spinner.start();
  }
}

export async function withSpinner<T>(verbose: number, message: string, callback: () => T | null) {
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
      logger.debug(err.stack);
      process.exit(1);
    } else {
      spinner.warn(`${message}: ${err as string}`);
    }
  }

  return null;
}
