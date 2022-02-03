import yargs from "yargs";
import { AppArguments } from "../pdkit";
import chalk from "chalk";
import path from "path";

export const command = "synth";
export const desc = "Synthesizes the projects configuration";

interface Args extends AppArguments {}

export const builder: yargs.CommandBuilder<any, any> = function (yargs) {
  return yargs;
};

export const handler = function (argv: Args) {
  const config = argv.config as string;

  process.chdir(path.dirname(config));

  const { workspace } = require(config);

  workspace.synthesize();

  console.log(chalk.greenBright("Project synthesis complete!"));
};
