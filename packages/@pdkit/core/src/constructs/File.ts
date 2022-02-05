import { IXConstruct, XConstruct } from "../base/XConstruct";
import { Project } from "../Project";
import path from "path";
import { VirtualFS } from "./VirtualFS";

export interface IFile extends IXConstruct {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;

  /**
   * The contents of the file, modified via writeFile or appendFile.
   */
  readonly content: string;

  /**
   * The calculated path for the file based on it's parent project
   */
  readonly realPath: string;
}

/**
 * XFiles are simple constructs for writing files to disk. Only one File for a
 * given path may exist at any one time.
 */
export class File extends XConstruct implements IFile {
  /**
   * Specify the files path relative to the parent project's source root.
   */
  public readonly path: string;

  /**
   * Holds the real contents temporarily until synthesis.
   * @protected
   */
  protected _content: string;

  constructor(scope: XConstruct, id: string, path: string) {
    super(scope, id);

    this.path = path;
    this._content = "";
  }

  /**
   * Prepares the construct with data to write to disk. The data is not written to disk until after
   * synthesis.
   *
   * @param text
   */
  writeFile(text: string) {
    this._content = text + "\n";
  }

  /**
   * Prepares the construct with data to write to disk. The data is not written to disk until after
   * synthesis.
   *
   * @param text
   */
  appendFile(text: string) {
    this._content += text;
  }

  /**
   * Returns the file contents.
   */
  get content() {
    return this._content;
  }

  get realPath() {
    const project = Project.of(this);

    return path.join(project.projectPath, this.path);
  }

  _synth() {
    super._synth();

    VirtualFS.of(this).writeFile(this);
  }

  /**
   * Determine if an object inherits this a File.
   *
   * @param construct
   */
  public static is(construct: any) {
    return construct instanceof this;
  }
}
