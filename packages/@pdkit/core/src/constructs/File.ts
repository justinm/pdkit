import path from "path";
import { IXConstruct, XConstruct } from "../base/XConstruct";
import { Project } from "../Project";
import { Workspace } from "../Workspace";
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
  readonly projectRelativePath: string;

  /**
   * If returns true, allow the file appended by multiple constructs
   */
  readonly appendMode: boolean;
}

export interface FileProps {
  readonly path: string;
  readonly append?: boolean;
}

/**
 * The File is simple construct for writing files to disk. Only one File for a
 * given path may exist at any one time and all files are staged in memory prior to
 * being written to disk.
 */
export class File extends XConstruct implements IFile {
  /**
   * Determine if an object inherits this a File.
   *
   * @param construct
   */
  public static is(construct: any) {
    return construct instanceof this;
  }

  /**
   * Specify the files path relative to the parent project's source root.
   */
  public readonly path: string;

  /**
   * Holds the real contents temporarily until synthesis.
   * @protected
   */
  protected _content: string;

  protected _append: boolean;

  constructor(scope: XConstruct, id: string, props: FileProps) {
    super(scope, id);

    this.path = props.path;
    this._append = props.append ?? false;
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

  /**
   * If returns true, allow the file appended by multiple constructs
   */
  get appendMode() {
    return this._append;
  }

  /**
   * Returns the path of the file relative to the workspace root.
   */
  get projectRelativePath() {
    const project = Project.of(this);

    return path.join(project.projectPath, this.path);
  }

  /**
   * Returns the path of the file absolute to the file system root
   */
  get absolutePath() {
    const workspace = Workspace.of(this);
    const project = Project.of(this);

    return path.join(workspace.rootPath, project.projectPath, this.path);
  }

  _onSynth() {
    VirtualFS.of(this).writeFile(this);
  }
}
