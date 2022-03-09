import { Construct, IConstruct } from "constructs";
import { IXConstruct, XConstruct } from "../base/XConstruct";
import { Script } from "../scripts/Script";
import { ConstructError } from "../util/ConstructError";
import { Project } from "./Project";
import { FileStatus, VirtualFS } from "./VirtualFS";

export interface IWorkspace extends IConstruct {
  readonly rootPath: string;
  synth(): void;
}

export interface WorkspaceProps {
  readonly rootPath?: string;
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

    return workspace as unknown as Workspace;
  }

  public readonly rootPath: string;

  constructor(id: string, props?: WorkspaceProps) {
    super(undefined as any, id);

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

    this.node
      .findAll()
      .filter((child) => (child as IXConstruct)._beforeSynth)
      .forEach((child) => (child as IXConstruct)._beforeSynth());
    this.node
      .findAll()
      .filter((child) => (child as IXConstruct)._onSynth)
      .forEach((child) => (child as IXConstruct)._onSynth());
    this.node
      .findAll()
      .filter((child) => (child as IXConstruct)._synth)
      .forEach((child) => (child as IXConstruct)._synth());
    this.node
      .findAll()
      .filter((child) => (child as IXConstruct)._validate)
      .forEach((child) => (child as IXConstruct)._validate());
    this.node
      .findAll()
      .filter((child) => (child as IXConstruct)._afterSynth)
      .forEach((child) => (child as IXConstruct)._afterSynth());
  }

  syncFilesToDisk({ force, dryRun }: { force?: boolean; dryRun?: boolean }): { path: string; reason: FileStatus }[] {
    const vfs = VirtualFS.of(this);
    const results: { path: string; reason: FileStatus }[] = [];

    for (const filePath of vfs.files) {
      const reason = vfs.getFileStatus(filePath);

      if (!dryRun && (force || reason !== FileStatus.CONFLICT)) {
        vfs.syncPathToDisk(filePath);
      }

      results.push({ path: filePath, reason });
    }

    return results;
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
