import { XConstruct } from "../base/XConstruct";

export abstract class Script extends XConstruct {
  readonly runnable: () => Promise<void>;

  constructor(scope: XConstruct, id: string, runnable: () => Promise<void>) {
    super(scope, id);

    this.runnable = runnable;
  }
}
