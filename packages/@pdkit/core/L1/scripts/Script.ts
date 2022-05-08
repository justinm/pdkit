import { Construct } from "constructs";

export abstract class Script extends Construct {
  readonly runnable: () => Promise<void>;

  constructor(scope: Construct, id: string, runnable: () => Promise<void>) {
    super(scope, id);

    this.runnable = runnable;
  }
}
