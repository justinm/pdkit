import { Construct } from "constructs";

export abstract class ShellScript extends Construct {
  static is(construct: any) {
    return construct instanceof this;
  }

  readonly command?: string[];

  constructor(scope: Construct, id: string, command?: string[]) {
    super(scope, id);

    this.command = command;
  }

  _beforeExecute(): void {}
  _afterExecute(): void {}
}
