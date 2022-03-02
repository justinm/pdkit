import { YarnTypescriptWorkspace } from "@pdkit/nodejs";

new YarnTypescriptWorkspace("MyProject", {
  author: {
    name: "Justin McCormick",
    email: "me@justinmccormick.com",
    organization: true,
  },
  license: "Apache-2.0",
  dependencies: ["mustache", "@pdkit/nodejs"],
  devDependencies: ["@pdkit/nodejs", "@types/mustache", "@types/node", "prettier", "ts-node", "typescript"],
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
