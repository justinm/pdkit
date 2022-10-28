import { Construct } from "constructs";
import { LifeCycle, LifeCycleStage, Project } from "../../../L1";
import { ManifestEntry } from "../../../L2";
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
  constructor(props?: YarnMonoWorkspaceProps) {
    super(props);

    const defaultProject = new YarnProject(this, "Default", { ...props, name: props?.name ?? "workspace" });

    LifeCycle.implement(this);
    LifeCycle.of(this).on(LifeCycleStage.BEFORE_SYNTH, () => {
      const projects = this.node.findAll().filter((b) => Project.is(b) && b !== this.node.defaultChild);
      const projectPaths = projects.map((p) => (p as NodeProject).projectPath.substring(1));

      // Collapse all install commands into the parent
      projects.forEach((p) => p.node.tryRemoveChild("InstallCommand"));

      if (props?.yalc) {
        new ManifestEntry(defaultProject, "RootYalcOverride", {
          scripts: {
            yalc: "yarn workspaces foreach --verbose -p --topological-dev --no-private run yalc",
          },
        });

        projectPaths.push(".yalc/*", ".yalc/*/*");
      }

      if (props?.jest) {
        new ManifestEntry(defaultProject, "RootJestOverride", {
          scripts: {
            test: 'yarn workspaces foreach --verbose -p --topological-dev --exclude "workspace" run test',
          },
        });
      }

      if (props?.eslint) {
        new ManifestEntry(defaultProject, "RootEslintOverride", {
          scripts: {
            lint: 'yarn workspaces foreach --verbose -p --topological-dev --exclude "workspace" run lint',
          },
        });
      }

      if (props?.typescript) {
        new ManifestEntry(defaultProject, "RootTypescriptOverride", {
          scripts: {
            compile: 'yarn workspaces foreach --verbose -p --topological-dev --exclude "workspace" run compile',
            clean: 'yarn workspaces foreach --verbose -p --topological-dev --exclude "workspace" run clean',
          },
        });
      }

      new ManifestEntry(this.node.defaultChild as Construct, "WorkspaceFields", {
        workspaces: projectPaths,
        private: true,
      });
    });
  }
}
