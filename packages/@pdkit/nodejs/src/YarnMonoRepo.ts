import { NodeProject, NodeProjectProps } from "./constructs/NodeProject";
import { ManifestEntry } from "../../core/src/constructs/ManifestEntry";
import { Project, Workspace, WorkspaceProps } from "../../core/src";
import { YarnSupport } from "./constructs/YarnSupport";

export interface IYarnMonoRepo {
  synth(): void;
}

export interface YarnMonoRepoProps
  extends Omit<NodeProjectProps, "packageManagerType" | "packageName" | "projectPath">,
    WorkspaceProps {
  readonly workspace?: Workspace;
}

export class YarnMonoRepo extends NodeProject implements IYarnMonoRepo {
  readonly workspace: Workspace;

  constructor(id: string, props?: YarnMonoRepoProps) {
    const workspace = props?.workspace ?? new Workspace("Workspace");
    super(workspace, id, { ...props, projectPath: "./", packageManagerType: undefined });

    new YarnSupport(this, "Yarn");

    this.workspace = workspace;
  }

  _beforeSynth() {
    const projects = this.workspace.binds.filter((b) => Project.is(b) && b !== this);
    const projectPaths = projects.map((p) => (p as Project).projectPath.substring(1));

    new ManifestEntry(this, "WorkspaceFields", {
      workspaces: projectPaths,
      private: true,
    });

    super._beforeSynth();
  }

  synth(): void {
    this.workspace.synth();
  }
}
