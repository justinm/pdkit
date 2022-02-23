import { YarnTypescriptProject } from "@pdkit/nodejs/src/yarn/YarnTypescriptProject";
import { YarnTypescriptWorkspace } from "@pdkit/nodejs/src/yarn/YarnTypescriptWorkspace";
import { GithubSupport } from "./packages/@pdkit/github/src/constructs/GithubSupport";
import { YarnBuildStep } from "./packages/@pdkit/github/src/nodejs/yarn/steps/YarnBuildStep";
import { YarnInstallStep } from "./packages/@pdkit/github/src/nodejs/yarn/steps/YarnInstallStep";

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
    enabled: true,
    prettier: true,
  },
  jest: {
    enabled: true,
  },
  gitignore: [".idea"],
});

new GithubSupport(workspace, "GithubSupport", {
  pullRequestLint: {
    enabled: true,
  },
  buildWorkflow: {
    enabled: true,
    buildStep: YarnBuildStep,
    setupStep: YarnInstallStep,
    artifactName: "build-artifact",
    artifactPath: "build",
  },
});

new YarnTypescriptProject(workspace, "core", {
  packageName: "@pdkit/core",
  projectPath: "packages/@pdkit/core",
  dependencies: [
    "case",
    "constructs",
    "deepmerge",
    "memfs",
    "mustache",
    "sync-request",
    "js-yaml",
    "winston",
    "dependency-graph",
  ],
  devDependencies: ["@types/mustache", "@types/js-yaml", "@types/winston"],
  eslint: {
    enabled: true,
    prettier: true,
  },
  jest: {
    enabled: true,
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
    enabled: true,
    prettier: true,
  },
  jest: {
    enabled: true,
  },
});

new YarnTypescriptProject(workspace, "nodejs", {
  packageName: "@pdkit/nodejs",
  projectPath: "packages/@pdkit/nodejs",
  dependencies: ["constructs", "dependency-graph", "@pdkit/core"],
  devDependencies: ["prettier", "typescript"],
  eslint: {
    enabled: true,
    prettier: true,
  },
  jest: {
    enabled: true,
  },
});

new YarnTypescriptProject(workspace, "github", {
  packageName: "@pdkit/github",
  projectPath: "packages/@pdkit/github",
  dependencies: ["constructs", "@pdkit/core"],
  devDependencies: ["prettier", "typescript"],
  eslint: {
    enabled: true,
    prettier: true,
  },
  jest: {
    enabled: true,
  },
});

export default workspace;
