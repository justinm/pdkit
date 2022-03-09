import { ManifestEntry, Project, XConstruct } from "@pdkit/core";
import { NodeProjectProps, NpmProject } from "../npm/NpmProject";
import { NpmWorkspace, NpmWorkspaceProps } from "../npm/NpmWorkspace";

export interface IYarnMonoRepo {
  synth(): void;
}

export interface YarnWorkspaceProps extends Omit<NodeProjectProps, "packageName" | "projectPath">, NpmWorkspaceProps {}

export class YarnWorkspace extends NpmWorkspace implements IYarnMonoRepo {
  constructor(id: string, props?: YarnWorkspaceProps) {
    super(id, props);
  }

  _beforeSynth() {
    const projects = this.node.findAll().filter((b) => Project.is(b));
    const projectPaths = projects.map((p) => (p as NpmProject).projectPath.substring(1));

    // Collapse all of the install commands into the parent
    projects.forEach((p) => p.node.tryRemoveChild("InstallCommand"));

    new ManifestEntry(this.node.defaultChild as XConstruct, "WorkspaceFields", {
      workspaces: projectPaths,
      private: true,
    });
  }
}
