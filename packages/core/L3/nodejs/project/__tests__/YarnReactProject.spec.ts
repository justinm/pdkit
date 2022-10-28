import { PostInstallShellScript } from "../../../../L1";
import { Manifest } from "../../../../L2";
import { YarnReactProject, YarnWorkspace } from "../../../../L3";

describe("ReactSupport", () => {
  it("creates a simple react project", () => {
    const workspace = new YarnWorkspace();

    const project = new YarnReactProject(workspace, "MyReactProject", {
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

    expect(fields.name).toBe("my-react-project");
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
    expect(fields.dependencies).toStrictEqual({ "@package/latest": "*", "@package/version": "^1", "react": "^18", "react-dom": "^18" });
    expect(fields.peerDependencies).toStrictEqual({ "@peerPackage/latest": "*", "@peerPackage/version": "^3" });
    expect(fields.devDependencies).toStrictEqual({
      "@stackgen/cli": "*",
      "@stackgen/core": "*",
      "@devPackage/latest": "*",
      "@devPackage/version": "^2",
      "react-scripts": "^5",
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
      build: "npx react-scripts build",
      start: "npx react-scripts start",
      test: "./myTestScript.sh",
    });
    expect(fields.a).toBeUndefined();
    expect(manifest.fields).toMatchSnapshot();

    const installCommand = project.node.tryFindChild("InstallCommand") as PostInstallShellScript;

    expect(installCommand).not.toBeUndefined();
    expect(installCommand.command).toStrictEqual(["yarn"]);
  });

  it("creates a typescript react project", () => {
    const workspace = new YarnWorkspace();

    const project = new YarnReactProject(workspace, "MyReactProject", {
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
      typescript: {},
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

    expect(fields.name).toBe("my-react-project");
    expect(fields.author).toStrictEqual({
      email: "test@example.com",
      name: "Test Example",
      organization: true,
      url: undefined,
    });
    expect(fields.description).toBe("MyDescription");
    expect(fields.private).toBe(true);
    expect(fields.main).toBe("build/index.js");
    expect(fields.files).toStrictEqual(["build/*.js", "build/**/*.js", "build/*.d.ts", "build/**/*.d.ts"]);
    expect(fields.dependencies).toStrictEqual({ "@package/latest": "*", "@package/version": "^1", "react": "^18", "react-dom": "^18" });
    expect(fields.peerDependencies).toStrictEqual({ "@peerPackage/latest": "*", "@peerPackage/version": "^3" });
    expect(fields.devDependencies).toStrictEqual({
      "@stackgen/cli": "*",
      "@stackgen/core": "*",
      "@devPackage/latest": "*",
      "@devPackage/version": "^2",
      "react-scripts": "^5",
      "@types/node": "*",
      "@types/react": "^18",
      "@types/react-dom": "^18",
      "ts-node": "*",
      "typescript": "*",
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
      build: "npx react-scripts build",
      start: "npx react-scripts start",
      test: "./myTestScript.sh",
      compile: "tsc -p ./tsconfig.json",
      clean:
        'find . -name "*.js" -not -path "./node_modules/*" -not -name config-overrides.js -not -name setupProxy.js -delete && find . -name "*.d.ts" -not -path "./node_modules/*" -delete',
    });
    expect(fields.a).toBeUndefined();
    expect(manifest.fields).toMatchSnapshot();

    const installCommand = project.node.tryFindChild("InstallCommand") as PostInstallShellScript;

    expect(installCommand).not.toBeUndefined();
    expect(installCommand.command).toStrictEqual(["yarn"]);
  });
});
