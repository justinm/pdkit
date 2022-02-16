import { YarnTypescriptProject } from "@pdkit/typescript/src";
import { YarnTypescriptWorkspace } from "@pdkit/typescript/src";

const workspace = new YarnTypescriptWorkspace("pdkit", {
  author: {
    name: "Justin McCormick",
    email: "me@justinmccormick.com",
    organization: true,
  },
  license: "Apache-2.0",
  dependencies: ["mustache", "@pdkit/nodejs", "@pdkit/typescript"],
  devDependencies: ["@types/mustache", "@types/node", "prettier", "ts-node", "typescript"],
  scripts: {
    pdkit: "ts-node packages/@pdkit/cli/src/pdkit.ts",
  },
});

new YarnTypescriptProject(workspace, "core", {
  packageName: "@pdkit/core",
  projectPath: "packages/@pdkit/core",
  dependencies: ["constructs", "deepmerge", "memfs", "mustache", "sync-request", "winston", "dependency-graph"],
  devDependencies: ["@types/mustache", "@types/winston"],
});

new YarnTypescriptProject(workspace, "cli", {
  packageName: "@pdkit/cli",
  projectPath: "packages/@pdkit/cli",
  dependencies: [
    "@pdkit/core",
    { name: "chalk", version: "^4.1.2" },
    { name: "ora", version: "^5.4.1" },
    "constructs",
    "glob",
    "glob-regex",
    "prompts",
    "yargs",
  ],
  devDependencies: ["@types/glob", "@types/ora", "@types/prompts", "@types/yargs"],
  bin: {
    pdkit: "dist/pdkit.js",
  },
});

new YarnTypescriptProject(workspace, "nodejs", {
  packageName: "@pdkit/nodejs",
  projectPath: "packages/@pdkit/nodejs",
  dependencies: ["constructs", "dependency-graph", "@pdkit/core"],
  devDependencies: ["prettier"],
});

new YarnTypescriptProject(workspace, "typescript", {
  packageName: "@pdkit/typescript",
  projectPath: "packages/@pdkit/typescript",
  dependencies: ["constructs", "dependency-graph", "@pdkit/core", "@pdkit/nodejs"],
  devDependencies: ["prettier", "typescript"],
});

export default workspace;
