import { InstallShellScript, ManifestEntry, TaskManager, XConstruct } from "@pdkit/core";

export interface NodePackageManagerProps {
  readonly installCommand: string[];
}

export class NpmTaskManager extends TaskManager {
  constructor(scope: XConstruct, props?: NodePackageManagerProps) {
    super(scope);

    new InstallShellScript(this, "InstallCommand", props?.installCommand);
  }

  _synth() {
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
