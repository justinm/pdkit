import { ManifestEntry, TaskManager } from "@pdkit/core";

export class NpmTaskManager extends TaskManager {
  _onSynth() {
    super._onSynth();

    const tm = TaskManager.of(this);

    tm.tasks.forEach((task) => {
      const commands: string[] = [];
      const deps = TaskManager.graph.dependenciesOf(task.fullyQualifiedName);

      for (const depName of deps) {
        const dep = TaskManager.graph.getNodeData(depName);

        commands.push(dep.command);
      }

      commands.push(task.command);

      new ManifestEntry(this, `Script-${task.fullyQualifiedName}`, {
        scripts: {
          [task.name]: commands.join(" && "),
        },
      });
    });
  }
}