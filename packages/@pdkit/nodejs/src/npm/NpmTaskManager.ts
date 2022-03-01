import { ManifestEntry, TaskManager } from "@pdkit/core/src";

export class NpmTaskManager extends TaskManager {
  _onBeforeSynth() {
    super._onBeforeSynth();

    const tm = TaskManager.of(this);

    tm.tasks.forEach((task) => {
      new ManifestEntry(this, `Script-${task.fullyQualifiedName}`, {
        scripts: {
          [task.name]: `npx pdkit run ${task.fullyQualifiedName}`,
        },
      });
    });
  }
}
