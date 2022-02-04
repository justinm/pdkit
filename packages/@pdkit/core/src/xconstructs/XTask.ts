import { XConstruct } from "./XConstruct";

export class XTask extends XConstruct {
  readonly commands: string[];
  constructor(scope: XConstruct, id: string, commands: string[]) {
    super(scope, id);

    this.commands = commands;
  }
}
