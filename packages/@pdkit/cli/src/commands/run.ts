import assert from "assert";
import { spawn } from "child_process";
import * as fs from "fs";
import path from "path";
import chalk from "chalk";
import { DepGraph } from "dependency-graph";
import ora from "ora";
import yargs from "yargs";
import { AppArguments } from "../pdkit";

export const command = "run <task>";
export const desc = "Runs a task for the given project";

export interface ITaskConfig {
  [key: string]: {
    dependencies: string[];
    commands: string[];
    cwd: string;
    projectName: string;
  };
}

export const builder: yargs.CommandBuilder<any, any> = function (y) {
  return y
    .positional("task", {
      type: "string",
      describe: "The name of the task to execute",
    })
    .option("dryrun", {
      alias: "n",
      type: "boolean",
    })
    .check((argv) => {
      argv.pathToTasks = path.join(argv.projectRoot, argv.taskConfig);

      if (!fs.existsSync(argv.pathToTasks)) {
        return `Could not load task configuration at ${argv.pathToTasks}`;
      }

      return true;
    });
};

export const handler = async function (argv: AppArguments) {
  const configPath = argv.pathToTasks as string;
  const task = argv.task as string;
  const data = JSON.parse(fs.readFileSync(configPath).toString("utf8"));

  const graph = rebuildGraph(data.tasks, task);

  await runTasks(graph, graph.overallOrder(), (argv._ as string[]).slice(1), argv.dryrun, argv.projectRoot);
};

function rebuildGraph(tasks: ITaskConfig, selectedTask: string) {
  const graph = new DepGraph<ITaskConfig[0]>();

  for (const taskName of Object.keys(tasks)) {
    graph.addNode(taskName, tasks[taskName]);
  }

  const scanTask = (taskName: string) => {
    if (tasks[taskName]) {
      for (const dep of tasks[taskName].dependencies) {
        graph.addDependency(taskName, dep);

        scanTask(dep);
      }
    }
  };

  scanTask(selectedTask);

  for (const taskName of Object.keys(tasks)) {
    const split = taskName.split(":");
    const structureName = split.slice(0, split.length - 1).join(":");
    const realTaskName = split[split.length - 1];

    if (selectedTask !== taskName && taskName.endsWith(realTaskName) && taskName.startsWith(structureName)) {
      graph.addDependency(selectedTask, taskName);
    }

    for (const dep of tasks[taskName].dependencies) {
      graph.addDependency(taskName, dep);
    }
  }

  return graph;
}

function writeWithSpinner(spinner: ora.Ora, text: string, stderr?: Boolean) {
  if (text && text !== "") {
    spinner.stop();
    process.stderr.write("\r");
    (stderr ? process.stderr : process.stdout).write(text.trimEnd() + "\n");
    spinner.start();
  }
}

async function runTasks(
  graph: DepGraph<ITaskConfig[0]>,
  tasks: string[],
  args: string[],
  dryRun: boolean,
  projectRoot: string
) {
  const spinner = ora();

  for (let i = 0; i < tasks.length; i++) {
    const taskName = tasks[i];
    const task = graph.getNodeData(taskName);

    assert(task.commands, "task entry missing commands");
    assert(task.cwd, "task entry missing cwd");
    assert(task.projectName, "task entry missing projectName");

    const cwd = path.join(projectRoot, task.cwd);

    let commandArgs = task.commands.slice(1);

    if (i >= tasks.length - 1 && args.length) {
      commandArgs.push(...args);
    }

    spinner.start(`Running ${taskName}`);

    if (!task.commands.length) {
      if (dryRun) {
        spinner.info();
      } else {
        spinner.succeed();
      }
      continue;
    }

    writeWithSpinner(spinner, chalk.gray(`Spawning: ${[task.commands[0]].concat(commandArgs).join(" ")} in ${cwd}`));

    if (!dryRun) {
      const cmd = spawn(task.commands[0], commandArgs, {
        env: process.env,
        cwd,
        stdio: [0, "pipe", "pipe"],
      });

      cmd.stdout?.on("data", (data) => {
        writeWithSpinner(spinner, data.toString());
      });

      cmd.stderr?.on("data", (data) => {
        writeWithSpinner(spinner, data.toString(), true);
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
