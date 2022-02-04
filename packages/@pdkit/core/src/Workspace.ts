import { Construct, IConstruct } from "constructs";
import { VirtualFileSystemManager } from "./util/VirtualFileSystemManager";
import { XProject } from "./xconstructs/XProject";

export interface IWorkspace extends IConstruct {
  readonly rootPath: string;
  synth(): void;
}

export interface WorkspaceProps {
  readonly rootPath?: string;
}

export class Workspace extends XProject implements IWorkspace {
  public readonly rootPath: string;
  public readonly vfs: VirtualFileSystemManager;

  constructor(id: string, props?: WorkspaceProps) {
    super(undefined as any, id);

    this.rootPath = props?.rootPath ?? process.cwd();
    this.vfs = new VirtualFileSystemManager(this, "Vfs");
  }

  synth() {
    return this._synth();
  }

  public static of(construct: any) {
    if (!(construct instanceof Construct)) {
      throw new Error(`${construct} is not a construct`);
    }

    const workspace = (construct as Construct).node.scopes.find(
      (scope) => scope !== construct && scope instanceof Workspace
    );

    if (!workspace) {
      throw new Error(`${construct} must be a child of a project`);
    }

    return workspace as Workspace;
  }
}
