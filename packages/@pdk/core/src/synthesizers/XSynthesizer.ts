import { Construct } from "constructs";
import { IXConstruct } from "../xconstructs/XConstruct";

export interface IXSynthesizer {
  _synthesize(construct: IXConstruct): any;
  _finalize(): void;
  _willHandleConstruct(construct: IXConstruct): boolean;
}

export abstract class XSynthesizer extends Construct implements IXSynthesizer {
  public abstract _synthesize(construct: IXConstruct): any;
  public abstract _finalize(): void;
  public abstract _willHandleConstruct(construct: IXConstruct): boolean;

  public static is(construct: any) {
    return construct instanceof this;
  }

  protected get parentScope() {
    const scopes = this.node.scopes;

    return scopes[scopes.length - 1];
  }
}
