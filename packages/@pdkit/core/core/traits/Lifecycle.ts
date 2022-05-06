import { Construct } from "constructs";
import { logger } from "../util/logger";

type Callback = () => void;

export enum LifeCycleStage {
  BEFORE_SYNTH = "BeforeSynth",
  SYNTH = "Synth",
  VALIDATE = "Validate",
  BEFORE_WRITE = "BeforeWrite",
  WRITE = "Write",
}

export interface ILifeCycle {}

const LIFECYCLE_SYMBOL = Symbol.for("@pdkit/core/core/traits/Ordering");

export class LifeCycle<T extends Construct> implements ILifeCycle {
  public static implement<T extends Construct>(instance: ILifeCycle) {
    if (!(instance as any)[LIFECYCLE_SYMBOL]) {
      (instance as any)[LIFECYCLE_SYMBOL] = new LifeCycle();
    } else {
      logger.warn(`Construct ${instance} attempted to implement LifeCycle multiple times and is likely a bug`);
    }
  }

  public static of<T extends Construct>(instance: ILifeCycle): LifeCycle<T> {
    const ret = this.tryOf<T>(instance);
    if (!ret) {
      throw new Error(`${instance.constructor.name}[${instance}] does not implement ILifeCycle. Use "LifeCycle.implement()" to implement`);
    }
    return ret;
  }

  /**
   * Return the matching Dependable for the given class instance.
   */
  public static tryOf<T extends Construct>(instance: ILifeCycle): LifeCycle<T> {
    return (instance as any)[LIFECYCLE_SYMBOL];
  }

  private lifecycle: Record<LifeCycleStage, Callback[]>;

  constructor() {
    this.lifecycle = {
      Validate: [],
      BeforeSynth: [],
      Synth: [],
      BeforeWrite: [],
      Write: [],
    };
  }

  public _run(lifecycle: LifeCycleStage) {
    if (this.lifecycle[lifecycle]) {
      for (const script of this.lifecycle[lifecycle]) {
        script();
      }
    }
  }

  public on(lifecycle: LifeCycleStage, callback: Callback) {
    if (!this.lifecycle[lifecycle]) {
      this.lifecycle[lifecycle] = [];
    }

    this.lifecycle[lifecycle].push(callback);
  }
}
