import { SemanticReleaseSupport, YarnMonoWorkspace, YarnProject } from "@pdkit/core/nodejs";
import { ManifestEntry, Project } from "@pdkit/core";

const workspace = new YarnMonoWorkspace("pdkit", {
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
    yalc: "yarn workspaces foreach --verbose -p --topological-dev --no-private run yalc",
  },
  tsconfig: {
    enabled: true,
  },
  eslint: {
    enabled: true,
    prettier: {},
    lineWidth: 140,
    doubleQuotes: true,
  },
  jest: {
    enabled: true,
  },
  gitignore: [".idea", ".js", ".d.ts"],
  github: {
    registryUrl: "https://registry.npmjs.org/",
    pullRequestLint: {
      enabled: true,
    },
    workflows: {
      build: {
        enabled: true,
        failOnMutation: true,
        commitMutations: false,
        coverage: {
          enabled: true,
        },
      },
      release: {
        branches: ["main"],
        enabled: true,
      },
    },
  },
});

new ManifestEntry(Project.of(workspace), "CustomResolutions", {
  resolutions: {
    "chalk": "^4.1.2",
  }
});

new SemanticReleaseSupport(workspace, {
  tool: "yarn",
  branches: ["main"],
  changelogs: true,
  releaseNotes: true,
});

new YarnProject(workspace, "core", {
  packageName: "@pdkit/core",
  projectPath: "packages/@pdkit/core",
  sourcePath: ".",
  distPath: ".",
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
  scripts: {
    yalc: "npx yalc publish"
  },
  devDependencies: ["@types/mustache", "@types/js-yaml", "@types/object-hash", "@types/winston"],
  tsconfig: {
    enabled: true,
  },
  eslint: {
    enabled: true,
    prettier: {},
    lineWidth: 140,
    doubleQuotes: true,
  },
  jest: {
    enabled: true,
  },
});

new YarnProject(workspace, "cli", {
  packageName: "@pdkit/cli",
  projectPath: "packages/@pdkit/cli",
  sourcePath: ".",
  distPath: ".",
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
  tsconfig: {
    enabled: true,
  },
  eslint: {
    enabled: true,
    prettier: {},
    lineWidth: 140,
    doubleQuotes: true,
  },
  jest: {
    enabled: true,
  },
});

export default workspace;
