import { XConstruct } from "./XConstruct";
import { Construct } from "constructs";

export class XTask extends XConstruct {
  readonly commands: string[];
  constructor(scope: Construct, id: string, commands: string[]) {
    super(scope, id);

    this.commands = commands;
  }
}
