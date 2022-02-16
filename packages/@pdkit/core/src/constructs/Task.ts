import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";
import { ManifestEntry } from "./ManifestEntry";
import { TaskManager } from "./TaskManager";

export class Task extends ManifestEntry {
  constructor(scope: XConstruct, id: string, commands: string[]) {
    const tm = TaskManager.of(scope);
    super(tm, id);

    const taskName = this.taskName;

    tm._bind(this);
    tm.graph.addNode(taskName, this);

    this.addFields({
      scripts: {
        [id]: commands.join(" "),
      },
    });
  }

  public dependsOn(task: Task | string) {
    if (task instanceof Task) {
      TaskManager.of(this).graph.addDependency(this.taskName, task.taskName);
    } else {
      TaskManager.of(this).graph.addDependency(this.taskName, task);
    }
  }

  get taskName() {
    const projects = this.node.scopes.filter((p) => Project.is(p)) as Project[];
    const prefix = projects.map((p) => p.node.id).join(":");

    return `${prefix}:${this.node.id}`;
  }
}
