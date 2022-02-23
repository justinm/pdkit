import { DepGraph } from "dependency-graph";
import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";
import { ConstructError } from "../util/ConstructError";
import { Task } from "./Task";

export class TaskManager extends XConstruct {
  public static readonly graph = new DepGraph<Task>();

  static of(construct: any): TaskManager {
    const project = Project.of(construct);

    const taskManager = project.node.findAll().find((b) => TaskManager.is(b)) as TaskManager;

    if (!taskManager) {
      throw new ConstructError(construct, `No task manager was found`);
    }

    return taskManager;
  }

  constructor(scope: XConstruct, id: string) {
    super(scope, id);
  }

  registerTask(task: Task) {
    TaskManager.graph.addNode(task.taskName, task);
  }

  get tasks() {
    const project = Project.of(this);

    return project.node.findAll().filter((t) => Task.is(t)) as Task[];
  }

  tryFindTask(taskName: string) {
    const project = Project.of(this);

    return this.tasks.filter((t) => t.node.id === taskName).find((t) => Project.of(t) === project) as Task | undefined;
  }

  findTask(taskName: string) {
    const result = this.tryFindTask(taskName);

    if (!result) {
      throw new Error(`Cannot find task ${taskName}`);
    }
  }

  tryAddDependency(task: Task, dependsOn: Task) {
    TaskManager.graph.addDependency(dependsOn.taskName, task.taskName);
  }

  tryAddTask(taskName: string, commands: string[]) {
    const existingTask = this.tryFindTask(taskName);

    if (!existingTask) {
      return new Task(this, taskName, commands);
    } else {
      existingTask.commands = commands;
    }

    return existingTask;
  }
}
