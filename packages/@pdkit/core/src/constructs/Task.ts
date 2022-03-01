import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";
import { ManifestEntry } from "./ManifestEntry";
import { TaskManager } from "./TaskManager";

export class Task extends ManifestEntry {
  protected _commands: string[];

  constructor(scope: XConstruct, id: string, commands: string[]) {
    super(scope, id);

    this._commands = [];
    this.commands = commands;
  }

  get commands() {
    return this._commands;
  }

  set commands(commands: string[]) {
    this._commands = commands;
    this.addFields({
      scripts: {
        [this.node.id]: `npx pdkit run ${this.taskName}`,
      },
    });
  }

  public dependsOn(task: Task | string) {
    const tm = TaskManager.of(this);

    if (task instanceof Task) {
      tm.tryAddDependency(this.taskName, task.taskName);
    } else {
      tm.tryAddDependency(this.taskName, task);
    }
  }

  get cwd() {
    return Project.of(this).projectPath;
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
