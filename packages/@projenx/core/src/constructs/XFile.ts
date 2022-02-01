import { IXConstruct, XConstruct } from "./XConstruct";
import { Construct } from "constructs";

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

export interface FileProps {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;
  /**
   * A dually owned file allows for developers to manually modify files while also maintaining part of the files
   * state.
   */
  readonly dualOwnership?: boolean;
}

export abstract class XFile extends XConstruct implements IXFile {
  /**
   * Specify the files path relative to the parent project's source root.
   */
  public readonly path: string;

  /**
   * A dually owned file allows for developers to manually modify files while also maintaining part of the files
   * state.
   */
  public readonly dualOwnership: boolean;
  protected _content: string;

  protected constructor(scope: Construct, id: string, props: FileProps) {
    super(scope, id);

    this.path = props.path;
    this.dualOwnership = props.dualOwnership ?? false;
    this._content = "";
  }

  public static is(construct: Construct) {
    return construct instanceof this;
  }

  writeFile(text: string) {
    this._content = text + "\n";
  }

  appendFile(text: string) {
    this._content += text;
  }

  get content() {
    return this._content;
  }
}
