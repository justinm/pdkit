import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import { IWorkspace, SG_CONFIG_FILE, Workspace } from "@stackgen/core";
import { logger } from "@stackgen/core/util/logger";
import { Construct } from "constructs";
import ora from "ora";
import shellEscape from "shell-escape";

export const spinner = ora();

export async function loadWorkspace(configPath: string) {
  const workspace = await withSpinner<IWorkspace>(0, "Loading workspace...", () => {
    process.chdir(path.dirname(configPath));

    if (!fs.existsSync(configPath)) {
      throw new Error(`No ${SG_CONFIG_FILE} could be found`);
    }
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const kit = require(configPath).default;
    const ws = Workspace.of(kit as Construct);

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

export async function spawnCommand(command: string[], props?: { env?: Record<string, string> }) {
  const cmd = shellEscape(command);

  const result = spawn(cmd, {
    env: {
      ...process.env,
      ...props?.env,
    },
    shell: true,
    stdio: [process.stdin, "pipe", "pipe"],
  });

  result.stdout.on("data", (data) => {
    spinner.stop();
    console.log(data.toString().trimEnd());
    spinner.start();
  });

  result.stderr.on("data", (data) => {
    spinner.stop();
    console.error(data.toString().trimEnd());
    spinner.start();
  });

  return new Promise<{ code: number }>((resolve) => {
    result.on("exit", (code) => {
      if (!code) {
        spinner.succeed();
      } else {
        spinner.fail();
      }

      resolve({ code: code ?? 0 });
    });
  });
}
