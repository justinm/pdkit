import * as fs from "fs";
import path from "path";
import chalk from "chalk";
import * as glob from "glob";
import yargs, { CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { run, synth } from "./commands";

export interface AppArguments extends yargs.ArgumentsCamelCase<any> {
  config?: string;
  c?: string;
}

const findPdk = () => {
  const parts = process.cwd().split("/");

  for (let x = parts.length; x >= 1; x--) {
    const rejoinedSegment = parts.slice(0, x).join("/");
    const check = path.join(rejoinedSegment, "pdk.*");
    const hits = glob.sync(check);

    if (hits.length) {
      return hits[0];
    }
  }

  return undefined;
};

const pdk = findPdk();

const parser = yargs(hideBin(process.argv))
  .parserConfiguration({
    "unknown-options-as-args": true,
  })
  .completion()
  .option("project-root", {
    alias: "r",
    default: pdk ? path.dirname(pdk) : undefined,
  })
  .option("config", {
    alias: "c",
    default: pdk ?? "pdk.js",
  })
  .option("task-config", {
    alias: "t",
    default: ".pdk/tasks.json",
  });

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

parser
  .command(wrapCommand(synth))
  .command(wrapCommand(run))
  .demandCommand()
  .check((args) => {
    if (!fs.existsSync(args.config)) {
      throw new Error("Unable to locate configuration at " + args.config);
    }

    return true;
  })
  .help()
  .strictCommands(false)
  .strictOptions(false)
  .parse()
  .then(() => {})
  .catch(console.error);
