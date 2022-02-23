import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";
import { ManifestEntry } from "./ManifestEntry";
import { TaskManager } from "./TaskManager";

export class Task extends ManifestEntry {
  protected _commands: string[];

  constructor(scope: XConstruct, id: string, commands: string[]) {
    const tm = TaskManager.of(scope);

    super(tm, id);

    this._commands = [];
    this.commands = commands;

    tm.registerTask(this);
  }

  get commands() {
    return this._commands;
  }

  set commands(commands: string[]) {
    this._commands = commands;
    this.addFields({
      scripts: {
        [this.node.id]: commands.join(" "),
      },
    });
  }

  public dependsOn(task: Task | string) {
    const tm = TaskManager.of(this);

    if (task instanceof Task) {
      tm.tryAddDependency(this, task);
    } else {
      const existingTask = tm.tryFindTask(task);

      if (existingTask) {
        tm.tryAddDependency(this, existingTask);
      }
    }
  }

  get taskName() {
    const projects = this.node.scopes.filter((p) => Project.is(p)) as Project[];

    return projects
      .map((p) => p.node.id)
      .concat(this.node.id)
      .join(":")
      .replace(/^Default:/, "");
  }
}
