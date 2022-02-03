import { Workspace } from "../../core/src/Workspace";
import { NodeProject, NodeProjectProps } from "./xconstructs/NodeProject";
import { XManifestEntry } from "../../core/src/xconstructs/XManifestEntry";
import { XProject } from "../../core/src/xconstructs/XProject";

export interface IYarnMonoRepo {
  synth(): void;
}

export interface YarnMonoRepoProps extends Omit<NodeProjectProps, "packageManagerType" | "packageName"> {
  readonly workspace?: Workspace;
}

export class YarnMonoRepo extends NodeProject implements IYarnMonoRepo {
  readonly workspace: Workspace;

  constructor(id: string, props?: YarnMonoRepoProps) {
    const workspace = props?.workspace ?? new Workspace("Workspace");
    super(workspace, id, props);

    this.workspace = workspace;
  }

  _onSynth() {
    const projectPaths: string[] = [];
    const scanProject = (project: XProject) => {
      project.subprojects.forEach((p) => projectPaths.push(p.projectPath.substring(1)));

      project.subprojects.forEach((p) => scanProject(p));
    };

    scanProject(this.workspace);

    new XManifestEntry(this, "WorkspaceFields", {
      workspaces: projectPaths,
      private: true,
    });
  }

  synth(): void {
    this.workspace.synth();
  }
}
