import { SemanticReleaseSupport, YarnTypescriptProject, YarnTypescriptWorkspace } from "@pdkit/nodejs";
import { YarnGithubSupport } from "@pdkit/github";

const workspace = new YarnTypescriptWorkspace("pdkit", {
  author: {
    name: "Justin McCormick",
    email: "me@justinmccormick.com",
    organization: true,
  },
  license: "Apache-2.0",
  dependencies: ["mustache", "@pdkit/nodejs", "@pdkit/github"],
  devDependencies: ["@types/mustache", "@types/node", "prettier", "ts-node", "typescript"],
  scripts: {
    pdkit: "ts-node packages/@pdkit/cli/src/pdkit.ts",
    build: "yarn workspaces foreach --verbose -pt run build",
    compile: "yarn workspaces foreach --verbose -pt run compile",
    clean: "yarn workspaces foreach --verbose -pt run clean",
  },
  eslint: {
    enabled: true,
    prettier: true,
  },
  jest: {
    enabled: true,
  },
  gitignore: [".idea", ".js", ".d.ts"],
});

new YarnGithubSupport(workspace, {
  pullRequestLint: {
    enabled: true,
  },
  workflows: {
    build: {
      cache: {
        "${{ runner.os }}-yarn-${{ hashFiles('**/yarn.lock') }}": ".yarn/cache",
      },
      enabled: true,
      failOnMutation: true,
      commitMutations: false,
    },
    release: {
      cache: {
        "${{ runner.os }}-yarn-release-${{ hashFiles('**/yarn.lock') }}": ".yarn/cache",
      },
      branches: ["main"],
      enabled: true,
    },
  },
});

new SemanticReleaseSupport(workspace, {
  branches: ["main"],
  changelogs: true,
  releaseNotes: true
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
    "object-hash",
    "sync-request",
    "js-yaml",
    "winston",
    "dependency-graph",
    "md5-file",
  ],
  devDependencies: ["@types/mustache", "@types/js-yaml", "@types/object-hash", "@types/winston"],
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
    "dependency-graph",
    "diff",
    "glob",
    "glob-regex",
    "prompts",
    "yargs",
  ],
  devDependencies: ["@types/diff", "@types/glob", "@types/ora", "@types/prompts", "@types/yargs"],
  bin: {
    pdkit: "pdkit.js",
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
