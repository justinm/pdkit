import { FileSynthesizer, PostInstallShellScript } from "../../../../L1";
import { Manifest } from "../../../../L2";
import { NodeProject, NodeWorkspace, TypescriptSupport } from "../../../../L3";

describe("NodeProject", () => {
  it("creates a generic NodeJS project", async () => {
    const workspace = new NodeWorkspace();
    const project = new NodeProject(workspace, "MyProject", {
      author: {
        email: "test@example.com",
        name: "Test Example",
        organization: true,
      },
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      scripts: {
        test: "./myTestScript.sh",
      },
      private: true,
      resolutions: { a: "b" },
      dependencies: ["@package/latest", { name: "@package/version", version: "^1" }],
      devDependencies: ["@devPackage/latest", { name: "@devPackage/version", version: "^2" }],
      peerDependencies: ["@peerPackage/latest", { name: "@peerPackage/version", version: "^3" }],
      bundledDependencies: ["@devPackage/latest"],
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;

    expect(fields.name).toBe("my-project");
    expect(fields.author).toStrictEqual({
      email: "test@example.com",
      name: "Test Example",
      organization: true,
      url: undefined,
    });
    expect(fields.description).toBe("MyDescription");
    expect(fields.private).toBe(true);
    expect(fields.main).toBe("build/index.js");
    expect(fields.files).toStrictEqual(["build/*.js", "build/**/*.js"]);
    expect(fields.dependencies).toStrictEqual({ "@package/latest": "*", "@package/version": "^1" });
    expect(fields.peerDependencies).toStrictEqual({ "@peerPackage/latest": "*", "@peerPackage/version": "^3" });
    expect(fields.devDependencies).toStrictEqual({
      "@stackgen/cli": "*",
      "@stackgen/core": "*",
      "@devPackage/latest": "*",
      "@devPackage/version": "^2",
    });
    expect(fields.bundledDependencies).toStrictEqual(["@devPackage/latest"]);
    expect(fields.resolutions).toStrictEqual({ a: "b" });
    expect(fields.repository).toStrictEqual({
      type: "git",
      url: "http://localhost",
    });
    expect(fields.jest).toBeUndefined();
    expect(fields.eslintConfig).toBeUndefined();
    expect(fields.publishConfig).toBeUndefined();
    expect(fields.scripts).toStrictEqual({
      test: "./myTestScript.sh",
    });
    expect(fields.a).toBeUndefined();
    expect(manifest.fields).toMatchSnapshot();

    const installCommand = project.node.tryFindChild("InstallCommand") as PostInstallShellScript;

    expect(installCommand).not.toBeUndefined();
    expect(installCommand.command).toStrictEqual(["npm", "install"]);
  });

  it("creates a generic NodeJS project with Yalc", async () => {
    const workspace = new NodeWorkspace();
    const project = new NodeProject(workspace, "MyProject", {
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      private: true,
      resolutions: { a: "b" },
      yalc: true,
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;

    expect(fields.name).toBe("my-project");
    expect(fields.description).toBe("MyDescription");
    expect(fields.private).toBe(true);
    expect(fields.main).toBe("build/index.js");
    expect(fields.files).toStrictEqual(["build/*.js", "build/**/*.js"]);
    expect(fields.devDependencies).toStrictEqual({ "@stackgen/cli": "*", "@stackgen/core": "*" });
    expect(fields.resolutions).toStrictEqual({ a: "b" });
    expect(fields.repository).toStrictEqual({
      type: "git",
      url: "http://localhost",
    });
    expect(fields.jest).toBeUndefined();
    expect(fields.eslintConfig).toBeUndefined();
    expect(fields.publishConfig).toBeUndefined();
    expect(fields.scripts).toStrictEqual({ yalc: "npx yalc publish" });
    expect(fields.a).toBeUndefined();
    expect(manifest.fields).toMatchSnapshot();
  });

  it("creates a generic NodeJS project with overloaded packageName", async () => {
    const workspace = new NodeWorkspace();
    const project = new NodeProject(workspace, "MyProject", {
      packageName: "@example/test",
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      private: true,
      resolutions: { a: "b" },
      yalc: true,
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;

    expect(fields.name).toBe("@example/test");
    expect(fields.description).toBe("MyDescription");
    expect(fields.private).toBe(true);
    expect(fields.main).toBe("build/index.js");
    expect(fields.files).toStrictEqual(["build/*.js", "build/**/*.js"]);
    expect(fields.devDependencies).toStrictEqual({ "@stackgen/cli": "*", "@stackgen/core": "*" });
    expect(fields.resolutions).toStrictEqual({ a: "b" });
    expect(fields.repository).toStrictEqual({
      type: "git",
      url: "http://localhost",
    });
    expect(fields.jest).toBeUndefined();
    expect(fields.eslintConfig).toBeUndefined();
    expect(fields.publishConfig).toBeUndefined();
    expect(fields.scripts).toStrictEqual({ yalc: "npx yalc publish" });
    expect(fields.a).toBeUndefined();
    expect(manifest.fields).toMatchSnapshot();
  });

  it("creates a generic NodeJS project with a license", async () => {
    const workspace = new NodeWorkspace();
    const project = new NodeProject(workspace, "MyProject", {
      license: "Apache-2.0",
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      private: true,
      resolutions: { a: "b" },
      yalc: true,
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;
    const vfs = FileSynthesizer.of(project);

    expect(vfs.virtualFiles).toContain("LICENSE");

    expect(fields.name).toBe("my-project");
    expect(fields.description).toBe("MyDescription");
    expect(fields.private).toBe(true);
    expect(fields.license).toBe("Apache-2.0");
    expect(fields.main).toBe("build/index.js");
    expect(fields.files).toStrictEqual(["build/*.js", "build/**/*.js"]);
    expect(fields.devDependencies).toStrictEqual({ "@stackgen/cli": "*", "@stackgen/core": "*" });
    expect(fields.resolutions).toStrictEqual({ a: "b" });
    expect(fields.repository).toStrictEqual({
      type: "git",
      url: "http://localhost",
    });
    expect(fields.jest).toBeUndefined();
    expect(fields.eslintConfig).toBeUndefined();
    expect(fields.publishConfig).toBeUndefined();
    expect(fields.scripts).toStrictEqual({ yalc: "npx yalc publish" });
    expect(fields.a).toBeUndefined();
    expect(manifest.fields).toMatchSnapshot();
  });

  it("creates a generic NodeJS project with Jest", async () => {
    const workspace = new NodeWorkspace();
    const project = new NodeProject(workspace, "MyProject", {
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      private: true,
      resolutions: { a: "b" },
      jest: {},
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;

    expect(fields.name).toBe("my-project");
    expect(fields.description).toBe("MyDescription");
    expect(fields.private).toBe(true);
    expect(fields.main).toBe("build/index.js");
    expect(fields.files).toStrictEqual(["build/*.js", "build/**/*.js"]);
    expect(fields.devDependencies).toStrictEqual({ "@stackgen/cli": "*", "@stackgen/core": "*", "jest": "*", "jest-junit": "^13" });
    expect(fields.resolutions).toStrictEqual({ a: "b" });
    expect(fields.repository).toStrictEqual({
      type: "git",
      url: "http://localhost",
    });
    expect(fields.jest).not.toBeUndefined();
    expect(fields.eslintConfig).toBeUndefined();
    expect(fields.publishConfig).toBeUndefined();
    expect(fields.a).toBeUndefined();
    expect(manifest.fields.jest).toMatchSnapshot();
  });

  it("creates a generic NodeJS project with Eslint", async () => {
    const workspace = new NodeWorkspace();
    const project = new NodeProject(workspace, "MyProject", {
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      private: true,
      resolutions: { a: "b" },
      eslint: {},
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;

    expect(fields.name).toBe("my-project");
    expect(fields.description).toBe("MyDescription");
    expect(fields.private).toBe(true);
    expect(fields.main).toBe("build/index.js");
    expect(fields.files).toStrictEqual(["build/*.js", "build/**/*.js"]);
    expect(fields.devDependencies).toStrictEqual({
      "@stackgen/cli": "*",
      "@stackgen/core": "*",
      "eslint": "*",
      "eslint-import-resolver-alias": "*",
      "eslint-import-resolver-node": "*",
      "eslint-plugin-import": "*",
    });
    expect(fields.resolutions).toStrictEqual({ a: "b" });
    expect(fields.repository).toStrictEqual({
      type: "git",
      url: "http://localhost",
    });
    expect(fields.jest).toBeUndefined();
    expect(fields.eslintConfig).not.toBeUndefined();
    expect(fields.publishConfig).toBeUndefined();
    expect(fields.a).toBeUndefined();
    expect(manifest.fields.eslintConfig).toMatchSnapshot();
  });

  it("creates a generic NodeJS project with Typescript", async () => {
    const workspace = new NodeWorkspace();
    const project = new NodeProject(workspace, "MyProject", {
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      private: true,
      resolutions: { a: "b" },
      typescript: {},
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;
    const ts = TypescriptSupport.of(project);

    expect(fields.name).toBe("my-project");
    expect(fields.description).toBe("MyDescription");
    expect(fields.private).toBe(true);
    expect(fields.main).toBe("build/index.js");
    expect(fields.files).toStrictEqual(["build/*.js", "build/**/*.js", "build/*.d.ts", "build/**/*.d.ts"]);
    expect(fields.devDependencies).toStrictEqual({
      "@stackgen/cli": "*",
      "@stackgen/core": "*",
      "@types/node": "*",
      "ts-node": "*",
      "typescript": "*",
    });
    expect(fields.resolutions).toStrictEqual({ a: "b" });
    expect(fields.repository).toStrictEqual({
      type: "git",
      url: "http://localhost",
    });
    expect(fields.jest).toBeUndefined();
    expect(fields.eslintConfig).toBeUndefined();
    expect(fields.publishConfig).toBeUndefined();
    expect(fields.a).toBeUndefined();

    const tsFields = ts.file.fields;

    expect(tsFields).toMatchSnapshot();
  });

  it("creates a generic NodeJS project with Eslint, Jest, and Typescript", async () => {
    const workspace = new NodeWorkspace();
    const project = new NodeProject(workspace, "MyProject", {
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      private: true,
      resolutions: { a: "b" },
      typescript: {},
      jest: {},
      eslint: {},
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;
    const ts = TypescriptSupport.of(project);

    expect(fields.name).toBe("my-project");
    expect(fields.description).toBe("MyDescription");
    expect(fields.private).toBe(true);
    expect(fields.main).toBe("build/index.js");
    expect(fields.files).toStrictEqual(["build/*.js", "build/**/*.js", "build/*.d.ts", "build/**/*.d.ts"]);
    expect(fields.devDependencies).toStrictEqual({
      "@stackgen/cli": "*",
      "@stackgen/core": "*",
      "@types/node": "*",
      "@types/jest": "*",
      "@typescript-eslint/eslint-plugin": "*",
      "@typescript-eslint/parser": "*",
      "ts-node": "*",
      "ts-jest": "*",
      "typescript": "*",
      "eslint": "*",
      "eslint-import-resolver-alias": "*",
      "eslint-import-resolver-node": "*",
      "eslint-import-resolver-typescript": "*",
      "eslint-plugin-import": "*",
      "jest": "*",
      "jest-junit": "^13",
    });
    expect(fields.resolutions).toStrictEqual({ a: "b" });
    expect(fields.repository).toStrictEqual({
      type: "git",
      url: "http://localhost",
    });
    expect(fields.jest).not.toBeUndefined();
    expect(fields.eslintConfig).not.toBeUndefined();
    expect(fields.publishConfig).toBeUndefined();
    expect(fields.a).toBeUndefined();

    const tsFields = ts.file.fields;

    expect(manifest.fields.jest).toMatchSnapshot();
    expect(manifest.fields.eslintConfig).toMatchSnapshot();
    expect(tsFields).toMatchSnapshot();
  });

  it("supports object supplied dependencies", () => {
    const workspace = new NodeWorkspace();

    const project = new NodeProject(workspace, "MyProject", {
      dependencies: {
        a: "^7",
      },
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;

    expect(fields.dependencies).toStrictEqual({ a: "^7" });
  });

  it("supports object supplied dependencies with merge", () => {
    const workspace = new NodeWorkspace();

    const project = new NodeProject(workspace, "MyProject", {
      devDependencies: {
        a: "^7",
      },
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;

    expect(fields.devDependencies).toStrictEqual({ "a": "^7", "@stackgen/cli": "*", "@stackgen/core": "*" });
  });
});
