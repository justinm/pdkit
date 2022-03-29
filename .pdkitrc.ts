import { SemanticReleaseSupport, YarnMonoWorkspace, YarnProject } from "@pdkit/nodejs";
import { YarnGithubSupport } from "@pdkit/github";
import { ManifestEntry, Project } from "@pdkit/core";

const workspace = new YarnMonoWorkspace("pdkit", {
  author: {
    name: "Justin McCormick",
    email: "me@justinmccormick.com",
  },
  license: "Apache-2.0",
  dependencies: ["mustache", { name: "@pdkit/core", version: "workspace:packages/@pdkit/core" }, { name: "@pdkit/github", version: "workspace:packages/@pdkit/github" }, { name: "@pdkit/nodejs", version: "workspace:packages/@pdkit/nodejs" }],
  devDependencies: ["@types/mustache", "@types/node", "prettier", "ts-node", "typescript"],
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
  registryUrl: "https://registry.npmjs.org/",
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
    prettier: true,
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
    "@pdkit/core",
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
    "ts-node",
    "yargs",
  ],
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
  devDependencies: [],
  bin: {
    pdkit: "index.ts",
  },
  tsconfig: {
    enabled: true,
  },
  eslint: {
    enabled: true,
    prettier: true,
  },
  jest: {
    enabled: true,
  },
});

new YarnProject(workspace, "nodejs", {
  packageName: "@pdkit/nodejs",
  projectPath: "packages/@pdkit/nodejs",
  sourcePath: ".",
  distPath: ".",
  dependencies: ["constructs", "@pdkit/core"],
  devDependencies: ["prettier", "typescript"],
  scripts: {
    yalc: "npx yalc publish"
  },
  tsconfig: {
    enabled: true,
  },
  eslint: {
    enabled: true,
    prettier: true,
  },
  jest: {
    enabled: true,
  },
});

new YarnProject(workspace, "github", {
  packageName: "@pdkit/github",
  projectPath: "packages/@pdkit/github",
  sourcePath: ".",
  distPath: ".",
  dependencies: ["constructs", "@pdkit/core", "@pdkit/nodejs"],
  devDependencies: ["prettier", "typescript"],
  scripts: {
    yalc: "npx yalc publish"
  },
  tsconfig: {
    enabled: true,
  },
  eslint: {
    enabled: true,
    prettier: true,
  },
  jest: {
    enabled: true,
  },
});

export default workspace;
