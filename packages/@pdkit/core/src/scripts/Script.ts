import { XConstruct } from "../base/XConstruct";
import { Workspace } from "../Workspace";

export abstract class Script extends XConstruct {
  readonly commands: string[];

  constructor(scope: XConstruct, id: string, commands: string[]) {
    super(scope, id);

    Workspace.of(scope)._bind(this);
    this.commands = commands;
  }

  static is(construct: any) {
    return construct instanceof this;
  }
}
