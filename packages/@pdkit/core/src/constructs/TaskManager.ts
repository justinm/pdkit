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

  static of(construct: any): TaskManager {
    const project = Project.of(construct);

    const taskManager = project.binds.find((b) => TaskManager.is(b)) as TaskManager;

    if (!taskManager) {
      throw new ConstructError(construct, `No task manager was found`);
    }

    return taskManager;
  }
}
