import { Project } from "../../../../L1";
import { Manifest } from "../../../../L2";
import { NodeProject, NodeWorkspace, YarnMonoWorkspace, YarnProject } from "../../../../L3";

describe("JestSupport", () => {
  describe("with NPM", () => {
    it("maintains user provided script", () => {
      const workspace = new NodeWorkspace();

      const project = new NodeProject(workspace, "MyProject", {
        scripts: {
          test: "./myTestScript.sh",
        },
        jest: {},
        eslint: {},
      });

      workspace.synth();

      const manifest = Manifest.of(project);
      const fields = manifest.fields;

      expect(fields.name).toBe("my-project");
      expect(fields.scripts).toStrictEqual({
        test: "./myTestScript.sh",
        lint: "eslint --ext .js src",
      });
    });
  });

  describe("with Yarn", () => {
    it("maintains user provided script", () => {
      const workspace = new YarnMonoWorkspace();

      const project = new YarnProject(workspace, "MyProject", {
        projectPath: "project/subfolder",
        scripts: {
          test: "./myTestScript.sh",
        },
        jest: {},
        eslint: {},
      });

      workspace.synth();

      const manifest = Manifest.of(project);
      const fields = manifest.fields;

      expect(fields.name).toBe("my-project");
      expect(fields.scripts).toStrictEqual({
        test: "./myTestScript.sh",
        lint: "eslint --ext .js src",
      });

      const workspaceProject = Project.of(workspace);
      const workspaceManifest = Manifest.of(workspaceProject);
      const workspaceFields = workspaceManifest.fields;

      expect(workspaceFields.name).toBe("workspace");
      expect(workspaceFields.private).toBe(true);
      expect(workspaceFields.workspaces).toStrictEqual(["project/subfolder"]);
    });

    it("provides correct workspace scripts", () => {
      const workspace = new YarnMonoWorkspace({
        typescript: {},
        jest: {},
        eslint: {},
      });

      const project = new YarnProject(workspace, "MyProject", {
        projectPath: "project/subfolder",
        typescript: {},
        jest: {},
        eslint: {},
      });

      workspace.synth();

      const manifest = Manifest.of(project);
      const fields = manifest.fields;

      expect(fields.name).toBe("my-project");
      expect(fields.scripts).toStrictEqual({
        clean: 'find . -name "*.js" -not -path "./node_modules/*" -delete && find . -name "*.d.ts" -not -path "./node_modules/*" -delete',
        compile: "tsc -p ./tsconfig.json",
        lint: "eslint --ext .ts src",
        test: "jest --passWithNoTests --all",
      });

      const workspaceProject = Project.of(workspace);
      const workspaceManifest = Manifest.of(workspaceProject);
      const workspaceFields = workspaceManifest.fields;

      expect(workspaceFields.name).toBe("workspace");
      expect(workspaceFields.private).toBe(true);
      expect(workspaceFields.workspaces).toStrictEqual(["project/subfolder"]);
      expect(workspaceFields.scripts).toStrictEqual({
        clean: 'yarn workspaces foreach --verbose -p --topological-dev --exclude "workspace" run clean',
        compile: 'yarn workspaces foreach --verbose -p --topological-dev --exclude "workspace" run compile',
        lint: 'yarn workspaces foreach --verbose -p --topological-dev --exclude "workspace" run lint',
        test: 'yarn workspaces foreach --verbose -p --topological-dev --exclude "workspace" run test',
      });
    });
  });
});
