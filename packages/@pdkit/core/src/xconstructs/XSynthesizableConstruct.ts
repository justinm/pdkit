import { XConstruct } from "./XConstruct";

export interface IXSynthesizableConstruct {
  _synth(): unknown;
}

export abstract class XSynthesizableConstruct extends XConstruct implements IXSynthesizableConstruct {
  public static is(construct: any) {
    return construct instanceof this;
  }

  abstract _synth(): unknown;
}
