import { Construct, IConstruct } from "constructs";
import { Bindings } from "../traits";

export interface IFile extends IConstruct {
  /**
   * Specify the entries path relative to the project root
   */
  readonly filePath: string;

  /**
   * The contents of the file, modified via writeFile or appendFile.
   */
  readonly content: string;
}

export interface FileProps {
  /**
   * The contents of the file, modified via writeFile or appendFile.
   */
  readonly content?: string;

  /**
   * Specify the files path relative to the parent project's source root.
   */
  readonly filePath: string;
}

/**
 * The File is simple construct for writing files to disk. Only one File for a
 * given path may exist at any one time and all files are staged in memory prior to
 * being written to disk.
 */
export class File extends Construct implements IFile {
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
  public readonly filePath: string;

  /**
   * Holds the real contents temporarily until synthesis.
   * @protected
   */
  protected _content: string;

  constructor(scope: Construct, id: string, props: FileProps) {
    super(scope, id);

    this.filePath = props.filePath;
    this._content = props?.content ?? "";

    Bindings.implement(this);
  }

  write(content: string) {
    this._content = content;
  }

  /**
   * Returns the file contents.
   */
  get content() {
    return this._content;
  }
}
