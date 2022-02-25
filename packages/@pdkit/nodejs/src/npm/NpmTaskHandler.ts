import { JsonFile, Task, TaskManager, Workspace, XConstruct } from "@pdkit/core/src";
import { NpmProject } from "./NpmProject";

export class NpmTaskHandler extends XConstruct {
  constructor(scope: XConstruct, id: string) {
    super(scope, id);

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];

        const handlers = Workspace.of(this)
          .node.findAll()
          .filter((s) => s instanceof NpmTaskHandler);

        if (handlers.length > 1) {
          errors.push("Only one NpmTaskManager may exist in a workspace at a time.");
        }

        return errors;
      },
    });
  }

  _onBeforeSynth() {
    const manifest = new JsonFile(this, "TaskManifest", { path: ".pdk/tasks.json" });

    Workspace.of(this)
      .node.findAll()
      .filter((n) => Task.is(n))
      .forEach((task) => {
        const t = task as Task;
        const project = NpmProject.of(t) as NpmProject;

        manifest.addFields({
          tasks: {
            [t.taskName]: {
              dependencies: TaskManager.graph.dependenciesOf(t.taskName),
              commands: t.commands,
              cwd: t.cwd,
              projectName: project.packageJson.fields.name,
            },
          },
        });
      });
  }
}
