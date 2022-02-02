import { IConstruct } from "constructs";

export class ConstructError extends Error {
  constructor(construct: IConstruct, message: string) {
    super(`${construct.constructor.name}(${construct.node.path}): ${message}`);
  }
}
