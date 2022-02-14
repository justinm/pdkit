import { IConstruct } from "constructs";

export class ConstructError extends Error {
  readonly simpleMessage: string;

  constructor(construct: IConstruct, message: string) {
    super(`${construct}: ${message}`);

    this.simpleMessage = message;
  }
}
