import { SemanticReleaseSupport, YarnTypescriptProject, YarnTypescriptWorkspace } from "@pdkit/nodejs";
import { YarnGithubSupport } from "@pdkit/github";
import { ManifestEntry, Project } from "@pdkit/core";

const workspace = new YarnTypescriptWorkspace("pdkit", {
  author: {
    name: "Justin McCormick",
    email: "me@justinmccormick.com",
  },
  license: "Apache-2.0",
  dependencies: ["mustache", { name: "@pdkit/core", version: "workspace:packages/@pdkit/core" }, { name: "@pdkit/github", version: "workspace:packages/@pdkit/github" }, { name: "@pdkit/nodejs", version: "workspace:packages/@pdkit/nodejs" }],
  devDependencies: ["@types/mustache", "@types/node", "prettier", "ts-node", "typescript"],
  scripts: {
    pdkit: "ts-node packages/@pdkit/cli/pdkit.ts",
    build: "yarn compile",
    compile: "yarn workspaces foreach --verbose -p --topological-dev --no-private run compile",
    clean: "yarn workspaces foreach --verbose -p --topological-dev --no-private run clean",
    yalc: "yarn workspaces foreach --verbose -p --topological-dev --no-private run yalc",
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
  scripts: {
    yalc: "yarn compile && npx yalc publish"
  },
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
    "shell-escape",
    "glob",
    "glob-regex",
    "prompts",
    "yargs",
  ],
  files: [
    "*.ts",
    "**/*.ts",
  ],
  scripts: {
    compile: undefined as any,
    yalc: "yarn compile && npx yalc publish"
  },
  devDependencies: ["@types/diff", "@types/glob", "@types/ora", "@types/prompts", "@types/shell-escape", "@types/yargs"],
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
  dependencies: ["constructs", "@pdkit/core"],
  devDependencies: ["prettier", "typescript"],
  scripts: {
    yalc: "yarn compile && npx yalc publish"
  },
  eslint: {
    enabled: true,
    prettier: true,
  },
  jest: {
    enabled: true,
  },
});

new YarnTypescriptProject(workspace, "react", {
  packageName: "@pdkit/react",
  projectPath: "packages/@pdkit/react",
  dependencies: ["constructs", "@pdkit/core", "@pdkit/nodejs"],
  devDependencies: ["prettier", "typescript"],
  scripts: {
    yalc: "yarn compile && npx yalc publish"
  },
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
  dependencies: ["constructs", "@pdkit/core", "@pdkit/nodejs"],
  devDependencies: ["prettier", "typescript"],
  scripts: {
    yalc: "yarn compile && npx yalc publish"
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
