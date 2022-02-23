import { Task, TaskManager, Workspace, XConstruct } from "@pdkit/core/src";
import { YamlFile } from "@pdkit/core/src/constructs/YamlFile";

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
    const manifest = new YamlFile(this, "TaskManifest", ".pdk/tasks.yaml");

    Workspace.of(this)
      .node.findAll()
      .filter((n) => Task.is(n))
      .forEach((task) => {
        const t = task as Task;
        manifest.addFields({
          [t.taskName]: {
            dependencies: TaskManager.graph.dependenciesOf(t.taskName),
            commands: t.commands,
          },
        });
      });

    TaskManager.graph
      .entryNodes()
      .map((n) =>
        console.log(
          n,
          TaskManager.graph.dependantsOf(n),
          TaskManager.graph.dependenciesOf(n),
          TaskManager.graph.directDependenciesOf(n)
        )
      );
  }
}
