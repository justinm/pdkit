import { IXConstruct, XConstruct } from "./XConstruct";
import { XVirtualFS } from "./XVirtualFS";

export interface IXFile extends IXConstruct {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;

  /**
   * The contents of the file, modified via writeFile or appendFile.
   */
  readonly content: string;
}

/**
 * XFiles are simple constructs for writing files to disk. Only one XFile for a
 * given path may exist at any one time.
 */
export class XFile extends XConstruct implements IXFile {
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

  _synth() {
    XVirtualFS.of(this).writeFile(this);
  }

  /**
   * Determine if an object inherits this a XFile.
   *
   * @param construct
   */
  public static is(construct: any) {
    return construct instanceof this;
  }
}
