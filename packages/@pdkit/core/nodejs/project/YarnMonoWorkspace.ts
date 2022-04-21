import { LifeCycle, ManifestEntry, Project, XConstruct } from "../../core";
import { NodeProject } from "./NodeProject";
import { NodeWorkspaceProps } from "./NodeWorkspace";
import { YarnProject, YarnProjectProps } from "./YarnProject";
import { YarnWorkspace } from "./YarnWorkspace";

export interface YarnMonoWorkspaceProps extends Omit<YarnProjectProps, "packageName" | "projectPath">, NodeWorkspaceProps {}

/**
 * A YarnMonoWorkspace creates a single YarnProject at the root of repository. All projects added after are considered
 * children of this project.
 */
export class YarnMonoWorkspace extends YarnWorkspace {
  constructor(id: string, props: YarnMonoWorkspaceProps) {
    super(id, props);

    const defaultProject = new YarnProject(this, "Default", { ...props, name: props.name ?? "workspace" });

    if (props.yalc) {
      new ManifestEntry(defaultProject, "RootYalcOverride", {
        scripts: {
          yalc: "yarn workspaces foreach --verbose -p --topological-dev --no-private run yalc",
        },
      });
    }

    this.addLifeCycleScript(LifeCycle.BEFORE_SYNTH, () => {
      const projects = this.node.findAll().filter((b) => Project.is(b) && b !== this.node.defaultChild);
      const projectPaths = projects.map((p) => (p as NodeProject).projectPath.substring(1));

      // Collapse all install commands into the parent
      projects.forEach((p) => p.node.tryRemoveChild("InstallCommand"));

      new ManifestEntry(this.node.defaultChild as XConstruct, "WorkspaceFields", {
        workspaces: projectPaths,
        private: true,
      });
    });
  }
}
