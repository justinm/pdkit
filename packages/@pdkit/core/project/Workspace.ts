import { Construct } from "constructs";
import { IXConstruct, LifeCycle, XConstruct } from "../base/XConstruct";
import { File } from "../fs";
import { Script } from "../scripts/Script";
import { FileSynthesizer } from "../synthesizers/FileSynthesizer";
import { ConstructError } from "../util/ConstructError";
import { Project, ProjectProps } from "./Project";

export interface IWorkspace extends IXConstruct {
  readonly fileSynthesizer: FileSynthesizer;

  synth(): void;
}

export interface WorkspaceProps extends Omit<ProjectProps, "projectPath"> {
  readonly rootPath?: string;
  readonly fileSynthesizer?: FileSynthesizer;
}

export class Workspace extends XConstruct implements IWorkspace {
  public static of(construct: any) {
    if (!(construct instanceof Construct)) {
      throw new Error(`${construct.constructor.name} is not a construct`);
    }

    const workspace = (construct as Construct).node.scopes[0];

    if (!workspace || !(workspace instanceof Workspace)) {
      throw new ConstructError(construct, `Not a child of a workspace`);
    }

    return workspace as unknown as IWorkspace;
  }

  public readonly fileSynthesizer: FileSynthesizer;

  constructor(id: string, props?: WorkspaceProps) {
    super(undefined as any, id);

    this.fileSynthesizer = props?.fileSynthesizer ?? new FileSynthesizer(props?.rootPath ?? process.cwd());

    this.addLifeCycleScript(LifeCycle.AFTER_SYNTH, () => {
      const projects = this.node.findAll().filter((p) => p instanceof Project) as Project[];

      for (const project of projects) {
        const files = project.tryFindDeepChildren(File);

        for (const file of files) {
          this.fileSynthesizer.writeVFile(project, file);
        }
      }
    });

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

    const everyNode = this.node.findAll().filter((child) => (child as IXConstruct).runLifeCycle);

    everyNode.forEach((child) => (child as IXConstruct).runLifeCycle(LifeCycle.BEFORE_SYNTH));
    everyNode.forEach((child) => (child as IXConstruct).runLifeCycle(LifeCycle.SYNTH));
    everyNode.forEach((child) => (child as IXConstruct).runLifeCycle(LifeCycle.VALIDATE));
    everyNode.forEach((child) => (child as IXConstruct).runLifeCycle(LifeCycle.AFTER_SYNTH));
  }

  async runScripts(type: typeof Script) {
    const scripts = this.node.findAll().filter((n) => n instanceof type) as Script[];

    for (const script of scripts) {
      await script.runnable();
    }
  }

  get projects() {
    return this.node.findAll().filter((b) => Project.is(b)) as Project[];
  }
}
