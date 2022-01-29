import { IXConstruct, XConstruct } from "./XConstruct";
import { Construct } from "constructs";

export interface IXFile extends IXConstruct {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;
  _synthesize(): any;
}

export interface FileProps {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;
}

export abstract class XFile extends XConstruct implements IXFile {
  public readonly path: string;
  protected content: string;

  protected constructor(scope: Construct, id: string, props: FileProps) {
    super(scope, id);

    this.path = props.path;
    this.content = "";
  }

  public static is(construct: Construct) {
    return construct instanceof this;
  }

  writeFile(text: string) {
    this.content = text + "\n";
  }

  appendFile(text: string) {
    this.content += text;
  }

  _synthesize() {
    return this.content;
  }
}
