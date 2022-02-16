import { YarnTypescriptProject } from "@pdkit/nodejs/src/yarn/YarnTypescriptProject";
import { YarnTypescriptWorkspace } from "@pdkit/nodejs/src/yarn/YarnTypescriptWorkspace";

const workspace = new YarnTypescriptWorkspace("pdkit", {
  author: {
    name: "Justin McCormick",
    email: "me@justinmccormick.com",
    organization: true,
  },
  license: "Apache-2.0",
  dependencies: ["mustache", "@pdkit/nodejs"],
  devDependencies: ["@types/mustache", "@types/node", "prettier", "ts-node", "typescript"],
  scripts: {
    pdkit: "ts-node packages/@pdkit/cli/src/pdkit.ts",
  },
  eslint: {
    prettier: true,
  },
});

new YarnTypescriptProject(workspace, "core", {
  packageName: "@pdkit/core",
  projectPath: "packages/@pdkit/core",
  dependencies: ["constructs", "deepmerge", "memfs", "mustache", "sync-request", "winston", "dependency-graph"],
  devDependencies: ["@types/mustache", "@types/winston"],
  eslint: {
    prettier: true,
  },
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
  eslint: {
    prettier: true,
  },
});

new YarnTypescriptProject(workspace, "nodejs", {
  packageName: "@pdkit/nodejs",
  projectPath: "packages/@pdkit/nodejs",
  dependencies: ["constructs", "dependency-graph", "@pdkit/core"],
  devDependencies: ["prettier", "typescript"],
  eslint: {
    prettier: true,
  },
});

export default workspace;
