import { Project } from "../../../../L1";
import { Manifest } from "../../../../L2";
import { YarnMonoWorkspace, YarnProject } from "../../../../L3";

describe("YarnMonoWorkspace", () => {
  it("creates a generic YarnMonoWorkspace", () => {
    const workspace = new YarnMonoWorkspace({
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      resolutions: { a: "b" },
    });

    workspace.synth();

    const project = YarnProject.of(workspace);

    const manifest = Manifest.of(project);
    const fields = manifest.fields;

    expect(fields.name).toBe("workspace");
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
    expect(fields.workspaces).toStrictEqual([]);
    expect(fields.a).toBeUndefined();
    expect(manifest.fields).toMatchSnapshot();
  });

  it("with a project", () => {
    const workspace = new YarnMonoWorkspace();

    const project = new YarnProject(workspace, "MyYarnProject", {
      projectPath: "project/subfolder",
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      private: true,
    });

    workspace.synth();

    const manifest = Manifest.of(project);
    const fields = manifest.fields;

    expect(fields.name).toBe("my-yarn-project");
    expect(fields.description).toBe("MyDescription");
    expect(fields.private).toBe(true);
    expect(fields.main).toBe("build/index.js");
    expect(fields.files).toStrictEqual(["build/*.js", "build/**/*.js"]);
    expect(fields.devDependencies).toBeUndefined();
    expect(fields.resolutions).toBeUndefined();
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

    const workspaceProject = Project.of(workspace);
    const workspaceManifest = Manifest.of(workspaceProject);
    const workspaceFields = workspaceManifest.fields;

    expect(workspaceFields.name).toBe("workspace");
    expect(workspaceFields.private).toBe(true);
    expect(workspaceFields.workspaces).toStrictEqual(["project/subfolder"]);
  });

  it("with a project supporting yalc", () => {
    const workspace = new YarnMonoWorkspace({
      yalc: true,
    });

    const project = new YarnProject(workspace, "MyYarnProject", {
      projectPath: "project/subfolder",
      description: "MyDescription",
      repository: {
        type: "git",
        url: "http://localhost",
      },
      private: true,
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
    expect(fields.devDependencies).toBeUndefined();
    expect(fields.resolutions).toBeUndefined();
    expect(fields.repository).toStrictEqual({
      type: "git",
      url: "http://localhost",
    });
    expect(fields.jest).toBeUndefined();
    expect(fields.eslintConfig).toBeUndefined();
    expect(fields.publishConfig).toBeUndefined();
    expect(fields.scripts).toStrictEqual({
      yalc: "npx yalc publish",
    });
    expect(fields.workspaces).toBeUndefined();
    expect(fields.a).toBeUndefined();
    expect(manifest.fields).toMatchSnapshot();

    const workspaceProject = Project.of(workspace);
    const workspaceManifest = Manifest.of(workspaceProject);
    const workspaceFields = workspaceManifest.fields;

    expect(workspaceFields.name).toBe("workspace");
    expect(workspaceFields.private).toBe(true);
    expect(workspaceFields.workspaces).toStrictEqual(["project/subfolder", ".yalc/*", ".yalc/*/*"]);
    expect(workspaceFields.scripts).toStrictEqual({
      yalc: "yarn workspaces foreach --verbose -p --topological-dev --no-private run yalc",
    });
  });
});
