import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";
import { DepGraph } from "dependency-graph";
import { Task } from "./Task";
import { ConstructError } from "../util/ConstructError";

export class TaskManager extends XConstruct {
  readonly graph: DepGraph<Task>;

  constructor(scope: XConstruct, id: string) {
    super(scope, id);

    this.graph = new DepGraph<Task>();

    Project.of(scope)._bind(this);
  }

  tryAddTask(taskName: string, commands: string[]) {
    const existingTask = this.binds.filter((b) => b instanceof Task).find((t) => t.node.id === taskName);

    if (!existingTask) {
      return new Task(this, taskName, commands);
    }

    return undefined;
  }

  static of(construct: any): TaskManager {
    const project = Project.of(construct);

    const taskManager = project.binds.find((b) => TaskManager.is(b)) as TaskManager;

    if (!taskManager) {
      throw new ConstructError(construct, `No task manager was found`);
    }

    return taskManager;
  }
}
