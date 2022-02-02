import yargs, { CommandModule } from "yargs";
import { hideBin } from "yargs/helpers";
import path from "path";
import * as glob from "glob";
import { synth } from "./commands";
import * as fs from "fs";
import chalk from "chalk";

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

const parser = yargs(hideBin(process.argv)).option("config", {
  alias: "c",
  default: findPdk() ?? ".pdk.js",
});

function wrapCommand<T extends CommandModule>(command: T): T {
  const handler = command.handler;
  command.handler = (args) => {
    try {
      return handler(args);
    } catch (err) {
      console.error(chalk.redBright((err as Error).message));
      process.exit(1);
    }
  };

  return command;
}

parser
  .command(wrapCommand(synth))
  .demandCommand()
  .check((args) => {
    if (!fs.existsSync(args.config)) {
      throw new Error("Unable to locate pdk configuration at " + args.config);
    }

    return true;
  })
  .help()
  .strictCommands()
  .strictOptions()
  .parse();
