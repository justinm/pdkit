import { Construct } from "constructs";
import { XSynthesizer } from "./XSynthesizer";
import { IXFile, XFile } from "../constructs/XFile";
import { IXConstruct } from "../constructs/XConstruct";
import { VirtualFileSystemManager } from "../util/VirtualFileSystemManager";
import { Workspace } from "../Workspace";

export interface IXFileSystemSynthesizer {
  /**
   * The root of the project relative to the root project's path. The path will be derived automatically if not provided.
   */
  readonly projectRelativePath?: string;
}

export interface XFileSystemSynthesizerProps {
  /**
   * The root of the project relative to the root project's path. The path will be derived automatically if not provided.
   */
  readonly projectRelativePath?: string;
}

export class XFileSystemSynthesizer extends XSynthesizer implements IXFileSystemSynthesizer {
  readonly projectRelativePath: string;
  private fs?: VirtualFileSystemManager;

  constructor(scope: Construct, id: string, props?: XFileSystemSynthesizerProps) {
    super(scope, id);
    this.projectRelativePath = props?.projectRelativePath ?? this.deriveProjectRelativePath();
  }

  _willHandleConstruct(construct: IXConstruct): boolean {
    return construct instanceof XFile;
  }

  _synthesize(construct: IXFile) {
    const workspace = Workspace.of(this);

    this.fs = new VirtualFileSystemManager(workspace.rootPath);

    this.fs.writeFile(construct);
  }

  _finalize() {
    this.fs?.syncToDisk();
  }

  protected deriveProjectRelativePath() {
    return "/";
  }
}
