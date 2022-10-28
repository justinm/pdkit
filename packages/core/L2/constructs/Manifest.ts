import { Construct } from "constructs";
import { JsonFile, Project, Workspace, Bindings, Fields, LifeCycle, LifeCycleStage } from "../../L1";
import { ManifestEntry } from "./ManifestEntry";

/**
 * Manifest represents a JSON manifest for a given project. Only one manifest may be present per project.
 */
export class Manifest extends JsonFile {
  /**
   * Check if a given construct is a Manifest.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }

  public static of(construct: Construct): Manifest {
    const project = Project.of(construct);
    const manifest = Bindings.of(project).findByClass(Manifest);

    if (!manifest) {
      throw new Error(`${construct}: No manifest was found in project ${project.node.id}`);
    }

    return manifest as Manifest;
  }

  constructor(scope: Construct, id: string, filePath: string) {
    super(scope, id, { filePath });

    LifeCycle.implement(this);
    LifeCycle.of(this).on(LifeCycleStage.BEFORE_WRITE, () => {
      const project = Project.of(this);
      const parentProjects = this.node.scopes.filter((s) => Project.is(s) && project !== s);
      const workspaceProject = Project.tryOf(Workspace.of(this));

      if (workspaceProject && parentProjects.indexOf(workspaceProject) === -1) {
        parentProjects.push(workspaceProject);
      }

      const parentManifestEntries = parentProjects
        .map((p) =>
          Bindings.of(p as Project)
            .filterByClass(ManifestEntry)
            .filter((entry) => entry.propagate)
        )
        .flat();

      for (const entry of parentManifestEntries) {
        const fields = Fields.of(entry);
        if (fields.fields) {
          if (entry.shallow) {
            this.addShallowFields(fields.fields);
          } else {
            this.addDeepFields(fields.fields);
          }
        }
      }

      const entries = Bindings.of(project).filterByClass(ManifestEntry);

      for (const entry of entries) {
        const fields = Fields.of(entry);

        if (entry.shallow) {
          this.addShallowFields(fields.fields);
        } else {
          this.addDeepFields(fields.fields);
        }
      }
    });
  }
}
