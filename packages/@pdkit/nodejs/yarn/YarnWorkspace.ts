import { LifeCycle, ManifestEntry, Project, XConstruct } from "@pdkit/core";
import { NpmProject, NpmProjectProps, NpmWorkspace, NpmWorkspaceProps } from "../npm";
import { YarnProject } from "./YarnProject";

export interface IYarnMonoRepo {
  synth(): void;
}

export interface YarnWorkspaceProps extends Omit<NpmProjectProps, "packageName" | "projectPath">, NpmWorkspaceProps {}

export class YarnWorkspace extends NpmWorkspace implements IYarnMonoRepo {
  constructor(id: string, props: YarnWorkspaceProps) {
    super(id, props);

    const defaultProject = new YarnProject(this, "Default", { ...props, name: props.name ?? "workspace" });

    this.addLifeCycleScript(LifeCycle.BEFORE_SYNTH, () => {
      const projects = this.node.findAll().filter((b) => Project.is(b) && b !== defaultProject);
      const projectPaths = projects.map((p) => (p as NpmProject).projectPath.substring(1));

      // Collapse all of the install commands into the parent
      projects.forEach((p) => p.node.tryRemoveChild("InstallCommand"));

      new ManifestEntry(this.node.defaultChild as XConstruct, "WorkspaceFields", {
        workspaces: projectPaths,
        private: true,
      });
    });
  }
}
