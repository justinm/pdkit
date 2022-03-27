#!/usr/bin/env node

import fs from "fs";
import path from "path";
import chalk from "chalk";
import glob from "glob";
import yargs, { CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import { synth } from "./commands";

const findPdk = () => {
  const parts = process.cwd().split("/");

  for (let x = parts.length; x >= 1; x--) {
    const rejoinedSegment = parts.slice(0, x).join("/");
    const check = path.join(rejoinedSegment, ".pdkitrc.ts");
    const hits = glob.sync(check);

    if (hits.length) {
      return hits[0];
    }
  }

  return undefined;
};

const pdk = findPdk();

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

yargs(hideBin(process.argv))
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
    requiresArg: true,
    required: true,
    require: true,
  })
  .option("task-config", {
    alias: "t",
    default: ".pdk/tasks.json",
  })
  .check((args) => {
    if (!fs.existsSync(args.config)) {
      throw new Error("Unable to locate configuration at " + args.config);
    }

    return true;
  })
  .command(wrapCommand(synth as any))
  .strict()
  .help()
  .strictCommands(false)
  .strictOptions(false)
  .parse();
