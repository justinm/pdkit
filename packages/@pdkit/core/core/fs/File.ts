import { IXConstruct, XConstruct } from "../base/XConstruct";

export interface IFile extends IXConstruct {
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
  readonly id?: string;
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
  public readonly filePath: string;

  /**
   * Holds the real contents temporarily until synthesis.
   * @protected
   */
  protected _content: string;

  constructor(scope: XConstruct, filePath: string, props?: FileProps) {
    super(scope, props?.id ?? `File-${filePath}`);

    this.filePath = filePath;
    this._content = "";
  }

  /**
   * Prepares the construct with data to write to disk. The data is not written to disk until after
   * synthesis.
   *
   * @param text
   */
  write(text: string) {
    this._content = text;
  }

  /**
   * Prepares the construct with data to write to disk. The data is not written to disk until after
   * synthesis.
   *
   * @param text
   */
  append(text: string) {
    this._content += text;
  }

  /**
   * Returns the file contents.
   */
  get content() {
    return this._content;
  }
}
