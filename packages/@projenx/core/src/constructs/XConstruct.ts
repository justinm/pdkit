import { Construct } from "constructs";

export interface IXConstruct {}

export abstract class XConstruct extends Construct implements IXConstruct {
  public static is(construct: any) {
    return construct instanceof this;
  }
}
