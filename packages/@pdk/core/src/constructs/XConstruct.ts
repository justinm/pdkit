import { Construct, IConstruct } from "constructs";

export interface IXConstruct extends IConstruct {}

export abstract class XConstruct extends Construct implements IXConstruct {
  constructor(scope: Construct, id: string) {
    super(scope, id.replace("/", "-"));
  }

  public static is(construct: any) {
    return construct instanceof this;
  }
}
