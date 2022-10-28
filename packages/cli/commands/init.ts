import { strict as assert } from "assert";
import fs from "fs";
import path from "path";
import { SG_CONFIG_FILE } from "@stackgen/core";
import yargs from "yargs";
import { spawnCommand, spinner } from "../utils";

export const command = "init";
export const desc = "Converts an existing npm/yarn project into a StackGen compatible repository";

export const builder: yargs.CommandBuilder<any, any> = function (y) {
  return y.option("dryrun", {
    alias: "n",
    type: "boolean",
  });
};

export const handler = async function ({ dryrun }: { config: string; dryrun: boolean; force: boolean; verbose: number }) {
  const cwd = process.cwd();

  const packageJsonPath = path.join(cwd, "package.json");
  const sgPath = path.join(cwd, SG_CONFIG_FILE);

  if (fs.existsSync(sgPath) && !dryrun) {
    return spinner.fail("This project has already been initialized");
  }

  if (!fs.existsSync(packageJsonPath)) {
    return spinner.fail("No package.json was found, first try initializing your project with `npm init` or `yarn init`");
  }

  const data = fs.readFileSync(packageJsonPath).toString("utf8");

  let packageJson: Record<string, any> | undefined = undefined;
  try {
    packageJson = JSON.parse(data);
  } catch (err) {
    return spinner.fail("File package.json is not valid JSON and cannot be read");
  }

  assert(packageJson);

  const packageConfig: Record<string, any> = {
    name: packageJson.name ?? "Your Project",
    author: {
      name: packageJson.author?.name ?? "Your Name",
      email: packageJson.author?.email ?? "email@example.com",
    },
    license: "MIT",
    dependencies: packageJson.depedencies ?? [],
    devDependencies: packageJson.devDependencies ?? [],
    bundledDependencies: packageJson.bundledDependencies ?? undefined,
    peerDependencies: packageJson.peerDependencies ?? undefined,
    scripts: {},
    eslint: {
      enabled: true,
      prettier: true,
    },
    jest: {
      enabled: true,
    },
  };

  if (fs.existsSync(path.join(cwd, ".npmignore"))) {
    packageConfig.npmignore = fs
      .readFileSync(path.join(cwd, ".npmignore"))
      .toString("utf8")
      .split("\n")
      .filter((l) => !!l || l !== "");
  }

  if (fs.existsSync(path.join(cwd, ".gitignore"))) {
    packageConfig.gitignore = fs
      .readFileSync(path.join(cwd, ".gitignore"))
      .toString("utf8")
      .split("\n")
      .filter((l) => !!l || l !== "");
  }

  const template = `
import { YarnTypescriptWorkspace } from "@stackgen/nodejs";

new YarnTypescriptWorkspace("${packageConfig.name.split("/").reverse()[0]}", ${JSON.stringify(packageConfig, undefined, 2)});
`;

  if (dryrun) {
    spinner.info(`Would write new ${SG_CONFIG_FILE} with contents`);
    console.log(template);
  } else {
    fs.writeFileSync(sgPath, template);
    spinner.succeed(`Writing to ${SG_CONFIG_FILE}`);
  }

  spinner.start("Running first-time synth");
  let code = await spawnCommand(["yarn", "stackgen", "synth", "-v"]);
  if (!code) {
    return;
  }

  return;
};
