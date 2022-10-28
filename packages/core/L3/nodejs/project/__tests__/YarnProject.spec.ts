import { PostInstallShellScript } from "../../../../L1";
import { Manifest } from "../../../../L2";
import { YarnProject, YarnWorkspace } from "../../../../L3";

describe("YarnProject", () => {
  it("creates a generic YarnProject", () => {
    const workspace = new YarnWorkspace();

    const project = new YarnProject(workspace, "MyYarnProject", {
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      private: true,
      resolutions: { a: "b" },
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;

    expect(fields.name).toBe("my-yarn-project");
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
    expect(fields.scripts).toBeUndefined();
    expect(fields.workspaces).toBeUndefined();
    expect(fields.a).toBeUndefined();
    expect(manifest.fields).toMatchSnapshot();
  });

  it("creates a generic YarnProject with Yalc", () => {
    const workspace = new YarnWorkspace();

    const project = new YarnProject(workspace, "MyYarnProject", {
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

    expect(fields.name).toBe("my-yarn-project");
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
    expect(fields.workspaces).toBeUndefined();
    expect(fields.a).toBeUndefined();
    expect(manifest.fields).toMatchSnapshot();

    const installCommand = project.node.tryFindChild("InstallCommand") as PostInstallShellScript;

    expect(installCommand).not.toBeUndefined();
    expect(installCommand.command).toStrictEqual(["yarn"]);
  });
});
