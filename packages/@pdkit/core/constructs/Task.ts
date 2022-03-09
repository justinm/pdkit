import { XConstruct } from "../base/XConstruct";
import { Project } from "./Project";
import { TaskManager } from "./TaskManager";

export class Task extends XConstruct {
  readonly name: string;
  protected _commands: string[];

  constructor(scope: XConstruct, name: string, commands?: string[]) {
    super(scope, `Task-${name}`);

    this.name = name;
    this._commands = commands ?? [];

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];
        const project = Project.of(this);

        if (!project) {
          errors.push("Construct is not a child of a project");
        }

        const tasks = project.tryFindDeepChildren(Task);

        tasks
          .filter((f) => this.name === f.name && this !== f)
          .forEach((f) => errors.push(`Construct is in conflict with ${f}`));

        return errors;
      },
    });
  }

  get command() {
    return this._commands.join(" ");
  }

  get commands() {
    return this._commands;
  }

  set commands(commands: string[]) {
    this._commands = commands;
  }

  public dependsOn(task: Task | string) {
    const tm = TaskManager.of(this);

    if (task instanceof Task) {
      tm.tryAddDependency(this.fullyQualifiedName, task.fullyQualifiedName);
    } else {
      tm.tryAddDependency(this.fullyQualifiedName, task);
    }
  }

  get cwd() {
    return Project.of(this).projectPath;
  }

  get fullyQualifiedName() {
    const projects = this.node.scopes.filter((p) => Project.is(p)) as Project[];

    return projects
      .map((p) => p.node.id)
      .concat(this.name)
      .join(":")
      .replace(/^Default:/, "");
  }
}
