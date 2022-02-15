import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";

export abstract class Script extends XConstruct {
  readonly runnable: () => void;

  constructor(scope: XConstruct, id: string, runnable: () => void) {
    super(scope, id);

    this.runnable = runnable;
  }

  _onBeforeSynth() {
    Project.of(this)._bind(this);
  }
}
