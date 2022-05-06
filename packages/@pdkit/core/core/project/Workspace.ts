import { Construct, IConstruct } from "constructs";
import { Script } from "../scripts/Script";
import { Bindings } from "../traits/Bindings";
import { LifeCycle, LifeCycleStage } from "../traits/Lifecycle";
import { logger } from "../util/logger";
import { ProjectProps } from "./Project";

export interface IWorkspace extends IConstruct {
  readonly rootPath: string;

  synth(): void;
}

export interface WorkspaceProps extends Omit<ProjectProps, "projectPath"> {
  readonly rootPath?: string;
}

export class Workspace extends Construct implements IWorkspace {
  public static of(construct: any) {
    if (!(construct instanceof Construct)) {
      throw new Error(`${construct.constructor.name}[${construct}] is not a construct`);
    }

    const workspace = (construct as Construct).node.scopes[0];

    if (!workspace || !(workspace instanceof Workspace)) {
      throw new Error(`${construct}: Not a child of a workspace`);
    }

    return workspace as unknown as IWorkspace;
  }

  public readonly rootPath: string;

  constructor(id: string, props?: WorkspaceProps) {
    super(undefined as any, id);
    Bindings.implement(this);

    this.rootPath = props?.rootPath ?? process.cwd();

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];

        if (this.node.scopes[0] !== this) {
          errors.push("A workspace must be the top-most construct");
        }

        return errors;
      },
    });
  }

  synth() {
    this.node.validate();

    const runLifecycle = (stage: LifeCycleStage) => {
      const everyNode = this.node.findAll(1).filter((child) => LifeCycle.tryOf(child));

      everyNode.forEach((child) => LifeCycle.of(child)._run(stage));
    };

    logger.debug("Running lifecycle BEFORE_SYNTH");
    runLifecycle(LifeCycleStage.BEFORE_SYNTH);
    logger.debug("Running lifecycle SYNTH");
    runLifecycle(LifeCycleStage.SYNTH);
    logger.debug("Running lifecycle VALIDATE");
    runLifecycle(LifeCycleStage.VALIDATE);
    logger.debug("Running lifecycle BEFORE_WRITE");
    runLifecycle(LifeCycleStage.BEFORE_WRITE);
    logger.debug("Running lifecycle WRITE");
    runLifecycle(LifeCycleStage.WRITE);
  }

  async runScripts(type: typeof Script) {
    const scripts = this.node.findAll().filter((n) => n instanceof type) as Script[];

    for (const script of scripts) {
      await script.runnable();
    }
  }
}
