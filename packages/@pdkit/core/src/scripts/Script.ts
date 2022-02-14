import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";

export abstract class Script extends XConstruct {
  readonly commands?: string[];

  constructor(scope: XConstruct, id: string, commands?: string[]) {
    super(scope, id);

    this.commands = commands;
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
