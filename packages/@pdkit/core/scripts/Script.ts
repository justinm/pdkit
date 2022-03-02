import { XConstruct } from "../base/XConstruct";

export abstract class Script extends XConstruct {
  readonly runnable: () => void;

  constructor(scope: XConstruct, id: string, runnable: () => void) {
    super(scope, id);

    this.runnable = runnable;
  }
}
