import fs from "fs";
import path from "path";
import chalk from "chalk";
import glob from "glob";
import yargs, { CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { init, synth } from "./commands";

const findConfig = () => {
  const parts = process.cwd().split("/");

  for (let x = parts.length; x >= 1; x--) {
    const rejoinedSegment = parts.slice(0, x).join("/");
    const check = path.join(rejoinedSegment, ".stackgenrc.ts");
    const hits = glob.sync(check);

    if (hits.length) {
      return hits[0];
    }
  }

  return undefined;
};

const config = findConfig();

function wrapCommand<T extends CommandModule>(command: T): T {
  const handler = command.handler;

  command.handler = (args) => {
    try {
      return handler(args);
    } catch (err) {
      console.error(chalk.redBright((err as Error).stack));
      process.exit(1);
    }
  };

  return command;
}

void yargs(hideBin(process.argv))
  .parserConfiguration({
    "unknown-options-as-args": true,
  })
  .completion()
  .option("project-root", {
    alias: "r",
    default: config ? path.dirname(config) : undefined,
  })
  .option("config", {
    alias: "c",
    default: config ?? "stackgenrc.js",
    requiresArg: true,
    required: true,
    require: true,
  })
  .option("task-config", {
    alias: "t",
    default: ".stackgen/tasks.json",
  })
  .check((args) => {
    if (!fs.existsSync(args.config)) {
      throw new Error("Unable to locate configuration at " + args.config);
    }

    return true;
  })
  .command(wrapCommand(synth as any))
  .command(wrapCommand(init as any))
  .strict()
  .help()
  .demandCommand()
  .strictCommands(false)
  .strictOptions(false)
  .parse();
