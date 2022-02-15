import { YarnTypescriptProject } from "@pdkit/typescript/src";
import { YarnTypescriptWorkspace } from "@pdkit/typescript/src";

const workspace = new YarnTypescriptWorkspace("pdkit", {
  author: {
    name: "Justin McCormick",
    email: "me@justinmccormick.com",
    organization: true,
  },
  // license: "Apache-2.0",
  dependencies: ["mustache"],
  devDependencies: [
    { name: "@pdkit/core", version: "^0.0.0" },
    { name: "@pdkit/nodejs", version: "^0.0.0" },
    { name: "@pdkit/typescript", version: "^0.0.0" },
    "@types/mustache",
    "@types/node",
    "prettier",
    "ts-node",
    "typescript",
  ],
  scripts: {
    pdkit: "ts-node packages/@pdkit/cli/src/pdkit.ts",
  },
});

new YarnTypescriptProject(workspace, "core", {
  packageName: "@pdkit/core",
  projectPath: "packages/@pdkit/core",
  dependencies: {
    memfs: "^3.4.1",
    mustache: "^4.2.0",
    "sync-request": "^6.1.0",
    winston: "^3.5.1",
    "dependency-graph": "^0.11.0",
  },
  devDependencies: ["@types/mustache", "@types/winston"],
});

new YarnTypescriptProject(workspace, "cli", {
  packageName: "@pdkit/cli",
  projectPath: "packages/@pdkit/cli",
  dependencies: {
    chalk: "^4.1.2",
    glob: "^7.2.0",
    "glob-regex": "^0.3.2",
    ora: "^5.4.1",
    prompt: "^1.2.1",
    prompts: "^2.4.2",
    yargs: "^17.3.1",
  },
  devDependencies: {
    "@types/glob": "^7.2.0",
    "@types/ora": "^3.2.0",
    "@types/prompts": "^2.0.14",
    "@types/yargs": "^17.0.8",
  },
  bin: {
    pdkit: "dist/pdkit.js",
  },
});

new YarnTypescriptProject(workspace, "nodejs", {
  packageName: "@pdkit/nodejs",
  projectPath: "packages/@pdkit/nodejs",
  dependencies: {
    constructs: "^10.0.47",
    deepmerge: "^4.2.2",
    "dependency-graph": "^0.11.0",
    "@pdkit/core": "^0.0.0",
  },
  devDependencies: {
    prettier: "^2.5.1",
  },
});

new YarnTypescriptProject(workspace, "typescript", {
  packageName: "@pdkit/typescript",
  projectPath: "packages/@pdkit/typescript",
  dependencies: {
    constructs: "^10.0.47",
    deepmerge: "^4.2.2",
    "dependency-graph": "^0.11.0",
    "@pdkit/core": "^0.0.0",
  },
  devDependencies: ["prettier", "typescript"],
});

export default workspace;
