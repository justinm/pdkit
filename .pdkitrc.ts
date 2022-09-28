import { SemanticReleaseSupport, YarnMonoWorkspace, YarnProject } from "@pdkit/core";

const workspace = new YarnMonoWorkspace({
  author: {
    name: "Justin McCormick",
    email: "me@justinmccormick.com",
  },
  license: "Apache-2.0",
  dependencies: ["mustache"],
  disableAutoLib: true,
  devDependencies: [
    { name: "@pdkit/core", version: "workspace:packages/@pdkit/core" },
    "@types/mustache",
    "@types/node",
    "prettier",
    "ts-node",
    "typescript"
  ],
  scripts: {
    pdkit: "yarn workspace @pdkit/cli run pdkit",
    build: "yarn compile",
    compile: "yarn workspaces foreach --verbose -p --topological-dev --no-private run compile",
    clean: "yarn workspaces foreach --verbose -p --topological-dev --no-private run clean",
    // lint: "yarn workspaces foreach --verbose -p --topological-dev --no-private run lint",
    // "lint:fix": "yarn workspaces foreach --verbose -p --topological-dev --no-private run lint --fix",
  },
  typescript: {},
  jest: {},
  eslint: {
    prettier: {},
    lineWidth: 140,
    doubleQuotes: true,
  },
  gitignore: [".idea", ".js", ".d.ts"],
  resolutions: {
    "chalk": "^4.1.2",
  },
});

new SemanticReleaseSupport(workspace, {
  tool: "yarn",
  branches: ["main"],
  changelogs: true,
  releaseNotes: true,
});

new YarnProject(workspace, "core", {
  license: "Apache-2.0",
  packageName: "@pdkit/core",
  projectPath: "packages/@pdkit/core",
  sourcePath: ".",
  buildPath: ".",
  dependencies: [
    "case",
    "constructs",
    "deepmerge",
    "memfs",
    "mustache",
    "object-hash",
    "js-yaml",
    "winston",
    "dependency-graph",
    "md5-file",
    "spdx-license-list"
  ],
  scripts: {
    yalc: "npx yalc publish"
  },
  devDependencies: ["@types/mustache", "@types/js-yaml", "@types/object-hash", "@types/winston"],
  typescript: {
  },
  eslint: {
    prettier: {},
    lineWidth: 140,
    doubleQuotes: true,
  },
  jest: {
  },
});

new YarnProject(workspace, "cli", {
  packageName: "@pdkit/cli",
  projectPath: "packages/@pdkit/cli",
  license: "Apache-2.0",
  sourcePath: ".",
  buildPath: ".",
  dependencies: [
    "@types/diff",
    "@types/glob",
    "@types/ora",
    "@types/prompts",
    "@types/shell-escape",
    "@types/yargs",
    { name: "chalk", version: "^4.1.2" },
    { name: "ora", version: "^5.4.1" },
    "constructs",
    "dependency-graph",
    "diff",
    "shell-escape",
    "glob",
    "glob-regex",
    "prompts",
    "typescript",
    "ts-node",
    "yargs",
  ],
  devDependencies: ["@pdkit/core"],
  peerDependencies: ["@pdkit/core"],
  files: [
    "*.ts",
    "**/*.ts",
    "tsconfig.json"
  ],
  scripts: {
    compile: undefined as any,
    pdkit: "npx npx pdkit",
    yalc: "npx yalc publish"
  },
  bin: {
    pdkit: "index.ts",
  },
  typescript: {
  },
  eslint: {
    prettier: {},
    lineWidth: 140,
    doubleQuotes: true,
  },
});

export default workspace;
