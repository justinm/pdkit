import { IConstruct } from "constructs";

export class ConstructError extends Error {
  readonly simpleMessage: string;

  constructor(construct: IConstruct, message: string) {
    super(`${construct.constructor.name}(${construct.node.path}): ${message}`);

    this.simpleMessage = message;
  }
}
