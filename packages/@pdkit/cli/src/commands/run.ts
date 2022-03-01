import { spawn } from "child_process";
import { Project, Task, TaskManager } from "@pdkit/core/src";
import chalk from "chalk";
import { DepGraph } from "dependency-graph";
import yargs from "yargs";
import { AppArguments } from "../pdkit";
import { loadWorkspace, spinner, synthWorkspace, writeWithSpinner } from "../utils";

export const command = "run <task>";
export const desc = "Runs a task for the given project";

// export interface ITaskConfig {
//   [key: string]: {
//     dependencies: string[];
//     commands: string[];
//     cwd: string;
//     projectName: string;
//   };
// }

export const builder: yargs.CommandBuilder<any, any> = function (y) {
  return y
    .positional("task", {
      type: "string",
      describe: "The name of the task to execute",
    })
    .option("dryrun", {
      alias: "n",
      type: "boolean",
    });
};

export const handler = async function (argv: AppArguments) {
  const taskName = argv.task as string;
  const config = argv.config as string;
  const workspace = await loadWorkspace(config);

  synthWorkspace(workspace);

  const tasks = workspace.node.findAll().filter((n) => Task.is(n)) as Task[];
  const task = tasks.find((t) => (t as Task).name === taskName);

  if (!task) {
    throw new Error(`No such task: ${taskName}`);
  }

  const graph = rebuildGraph(tasks, task);
  await runTasks(graph, graph.overallOrder(), (argv._ as string[]).slice(1), argv.dryrun);
};

function rebuildGraph(tasks: Task[], selectedTask: Task) {
  const graph = new DepGraph<Task>();

  const scanTask = (task: Task) => {
    graph.addNode(task.fullyQualifiedName, task);

    for (const dep of TaskManager.graph.dependenciesOf(task.fullyQualifiedName)) {
      graph.addDependency(task.fullyQualifiedName, dep);

      scanTask(TaskManager.graph.getNodeData(dep));
    }
  };

  scanTask(selectedTask);

  return graph;
}

async function runTasks(graph: DepGraph<Task>, taskOrder: string[], args: string[], dryRun: boolean) {
  for (let i = 0; i < taskOrder.length; i++) {
    const taskName = taskOrder[i];
    const task = graph.getNodeData(taskName);
    const cwd = Project.of(task).absolutePath;

    let commandArgs = task.commands.slice(1);

    if (i >= taskOrder.length - 1 && args.length) {
      commandArgs.push(...args);
    }

    spinner.start(`Running ${task.fullyQualifiedName}`);

    if (!task.commands.length) {
      if (dryRun) {
        spinner.info();
      } else {
        spinner.succeed();
      }
      continue;
    }

    writeWithSpinner(chalk.gray(`Spawning: ${[task.commands[0]].concat(commandArgs).join(" ")} in ${cwd}`));

    if (!dryRun) {
      const cmd = spawn(task.commands[0], commandArgs, {
        env: process.env,
        cwd,
        stdio: [0, "pipe", "pipe"],
      });

      cmd.stdout?.on("data", (data) => {
        writeWithSpinner(data.toString());
      });

      cmd.stderr?.on("data", (data) => {
        writeWithSpinner(data.toString(), true);
      });

      const exitCode = await new Promise<number>((resolve) => {
        cmd.on("close", (code: number) => {
          resolve(code);
        });
      });

      if (!exitCode) {
        spinner.succeed();
      } else {
        spinner.fail();
        process.exit(exitCode);
      }
    } else {
      spinner.info();
    }
  }
}
