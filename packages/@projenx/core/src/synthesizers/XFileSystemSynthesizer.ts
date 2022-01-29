import { Construct } from "constructs";
import { XSynthesizer } from "./XSynthesizer";
import { IXFile, XFile } from "../constructs/XFile";
import * as path from "path";
import { IXConstruct } from "../constructs/XConstruct";

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

  constructor(scope: Construct, id: string, props?: XFileSystemSynthesizerProps) {
    super(scope, id);
    this.projectRelativePath = props?.projectRelativePath ?? this.deriveProjectRelativePath();
  }

  _willHandleConstruct(construct: IXConstruct): boolean {
    return construct instanceof XFile;
  }

  _synthesize(construct: IXFile) {
    const realpath = path.join(this.projectRelativePath, construct.path);
    const content = construct._synthesize();

    console.log(`FS: ${realpath} = ${content}`);
  }

  _finalize() {}

  protected deriveProjectRelativePath() {
    return "/";
  }
}
