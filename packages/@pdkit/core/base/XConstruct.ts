import { Construct, IConstruct } from "constructs";

type Callback = () => void;

export enum LifeCycle {
  VALIDATE = "Validate",
  BEFORE_SYNTH = "BeforeSynth",
  SYNTH = "Synth",
  AFTER_SYNTH = "AfterSynth",
}

export interface IXConstruct extends IConstruct {
  runLifeCycle(lifecycle: LifeCycle): void;
}

/**
 * The XConstruct, the base of all constructs for pdkit.
 */
export abstract class XConstruct extends Construct implements IXConstruct {
  /**
   * Determines if the given argument is an XConstruct.
   *
   * @param construct
   */
  public static is(construct: any) {
    return construct instanceof this;
  }

  private lifecycle: Record<LifeCycle, Callback[]>;

  constructor(scope: XConstruct, id: string) {
    super(scope, id.replace("/", "-"));

    this.lifecycle = {
      Validate: [],
      BeforeSynth: [],
      Synth: [],
      AfterSynth: [],
    };
  }

  public _validate() {
    const errors = this.node.validate();

    if (errors.length) {
      throw new Error(`Construct ${this} did not validate: ${errors.join("\n")}`);
    }
  }

  toString(): string {
    return `${this.constructor.name}(${this.node.path})`;
  }

  public runLifeCycle(lifecycle: LifeCycle) {
    if (this.lifecycle[lifecycle]) {
      for (const script of this.lifecycle[lifecycle]) {
        script();
      }
    }
  }

  protected addLifeCycleScript(lifecycle: LifeCycle, callback: Callback) {
    if (!this.lifecycle[lifecycle]) {
      this.lifecycle[lifecycle] = [];
    }

    this.lifecycle[lifecycle].push(callback);
  }
}
