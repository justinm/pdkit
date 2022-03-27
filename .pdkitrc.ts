import { SemanticReleaseSupport, YarnTypescriptProject, YarnTypescriptWorkspace } from "@pdkit/nodejs";
import { YarnGithubSupport } from "@pdkit/github";
import { ManifestEntry, Project } from "@pdkit/core";

const workspace = new YarnTypescriptWorkspace("pdkit", {
  author: {
    name: "Justin McCormick",
    email: "me@justinmccormick.com",
    organization: true,
  },
  license: "Apache-2.0",
  dependencies: ["mustache", { name: "@pdkit/core", version: "workspace:packages/@pdkit/core" }, { name: "@pdkit/nodejs", version: "workspace:packages/@pdkit/nodejs" }, { name: "@pdkit/github", version: "workspace:packages/@pdkit/github" }],
  devDependencies: ["@types/mustache", "@types/node", "prettier", "ts-node", "typescript"],
  scripts: {
    pdkit: "ts-node packages/@pdkit/cli/pdkit.ts",
    build: "yarn compile",
    compile: "yarn workspaces foreach --verbose -p --topological-dev --no-private run compile",
    clean: "yarn workspaces foreach --verbose -p --topological-dev --no-private run clean",
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

new ManifestEntry(Project.of(workspace), "CustomResolutions", {
  resolutions: {
    "chalk": "^4.1.2",
  }
});

new YarnGithubSupport(workspace, {
  pullRequestLint: {
    enabled: true,
  },
  workflows: {
    build: {
      enabled: true,
      failOnMutation: true,
      commitMutations: false,
    },
    release: {
      branches: ["main"],
      enabled: true,
    },
  },
});

new SemanticReleaseSupport(workspace, {
  tool: "yarn",
  branches: ["main"],
  changelogs: true,
  releaseNotes: true,
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
    { name: "@pdkit/core", version: "workspace:packages/@pdkit/core" },
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
  dependencies: ["constructs", "dependency-graph", { name: "@pdkit/core", version: "workspace:packages/@pdkit/core" }],
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
  dependencies: ["constructs", { name: "@pdkit/core", version: "workspace:packages/@pdkit/core" }, { name: "@pdkit/nodejs", version: "workspace:packages/@pdkit/nodejs" }],
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
