import { ManifestEntry, TaskManager } from "@pdkit/core/src";

export class NpmTaskManager extends TaskManager {
  _onBeforeSynth() {
    super._onBeforeSynth();

    const tm = TaskManager.of(this);

    tm.tasks.forEach((task) => {
      new ManifestEntry(this, `Script-${task.taskName}`, {
        scripts: {
          [task.node.id]: `npx pdkit run ${task.taskName}`,
        },
      });
    });
  }
}
