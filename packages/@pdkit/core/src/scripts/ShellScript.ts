import { XConstruct } from "../base/XConstruct";

export abstract class ShellScript extends XConstruct {
  static is(construct: any) {
    return construct instanceof this;
  }

  readonly command?: string[];

  constructor(scope: XConstruct, id: string, command?: string[]) {
    super(scope, id);

    this.command = command;
  }

  _beforeExecute(): void {}
  _afterExecute(): void {}
}
