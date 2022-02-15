import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";

export abstract class ShellScript extends XConstruct {
  readonly command?: string[];

  constructor(scope: XConstruct, id: string, command?: string[]) {
    super(scope, id);

    this.command = command;
  }

  _onBeforeSynth() {
    Project.of(this)._bind(this);
  }

  _beforeExecute(): void {}
  _afterExecute(): void {}

  static is(construct: any) {
    return construct instanceof this;
  }
}
