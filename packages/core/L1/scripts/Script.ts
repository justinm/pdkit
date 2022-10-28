import { Construct } from "constructs";

export class Script extends Construct {
  readonly runnable: () => Promise<void>;

  constructor(scope: Construct, id: string, runnable: () => Promise<void>) {
    super(scope, id);

    this.runnable = runnable;
  }
}
