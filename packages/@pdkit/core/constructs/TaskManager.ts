import assert from "assert";
import { DepGraph } from "dependency-graph";
import { XConstruct } from "../base/XConstruct";
import { ConstructError } from "../util/ConstructError";
import { Project } from "./Project";
import { Task } from "./Task";

export abstract class TaskManager extends XConstruct {
  public static readonly graph = new DepGraph<Task>();

  static of(construct: any): TaskManager {
    const project = Project.of(construct);

    const taskManager = project.node.findAll().find((b) => TaskManager.is(b)) as TaskManager;

    if (!taskManager) {
      throw new ConstructError(construct, `No task manager was found`);
    }

    return taskManager;
  }

  private dependencyCache: string[][] = [];

  constructor(scope: XConstruct) {
    super(scope, "TaskManager");

    new Task(this, "build");
    new Task(this, "lint");
    new Task(this, "test");

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];

        const handlers = Project.of(this).tryFindDeepChildren(TaskManager);

        if (handlers.length > 1) {
          errors.push("Only one TaskManager may exist in a project at a time.");
        }

        return errors;
      },
    });
  }

  get tasks() {
    return Project.of(this).tryFindDeepChildren(Task) as Task[];
  }

  tryFindTask(taskName: string) {
    return this.tasks.find((t) => t.name === taskName) as Task | undefined;
  }

  findTask(taskName: string) {
    const result = this.tryFindTask(taskName);

    if (!result) {
      throw new Error(`Cannot find task ${taskName}`);
    }
  }

  tryAddDependency(task: string, dependsOn: string) {
    this.dependencyCache.push([task, dependsOn]);
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

  _onSynth() {
    super._onSynth();
    const project = Project.of(this);
    const tasks = project.tryFindDeepChildren(Task);

    tasks.forEach((task) => TaskManager.graph.addNode(task.fullyQualifiedName, task));

    this.dependencyCache.forEach((entry) => {
      const task = this.tryFindTask(entry[0]);
      const dependsOn = this.tryFindTask(entry[1]);

      assert(task);
      assert(dependsOn);

      TaskManager.graph.addDependency(task?.fullyQualifiedName, dependsOn?.fullyQualifiedName);
    });
  }

  // _synth() {
  //   super._synth();
  //
  //   const project = Project.of(this);
  //   const tasks = project.tryFindDeepChildren(Task);
  //   const subprojects = project.tryFindDeepChildren(Project);
  //
  //   for (const subproject of subprojects) {
  //     const subtasks = subproject.tryFindDeepChildren(Task);
  //
  //     const getParentTask = (subtask: Task) => {
  //       const results = tasks.filter((t) => t.name === subtask.name);
  //
  //       if (results.length) {
  //         return results[0];
  //       }
  //
  //       return null;
  //     };
  //
  //     for (const subtask of subtasks) {
  //       const parentTask = getParentTask(subtask);
  //
  //       if (parentTask) {
  //         const task = new Task(this, parentTask.name + ":all");
  //
  //         TaskManager.graph.addNode(task.fullyQualifiedName, task);
  //         TaskManager.graph.addDependency(task?.fullyQualifiedName, subtask.fullyQualifiedName);
  //       }
  //     }
  //   }
  // }
}
