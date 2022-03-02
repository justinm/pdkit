import { Construct, IConstruct } from "constructs";
import { ConstructError } from "../util/ConstructError";

export interface IXConstruct extends IConstruct {
  _beforeSynth(): void;
  _onSynth(): void;
  _synth(): void;
  _afterSynth(): void;
  _validate(): void;
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

  constructor(scope: XConstruct, id: string) {
    super(scope, id.replace("/", "-"));
  }

  public _validate() {
    const errors = this.node.validate();

    if (errors.length) {
      throw new ConstructError(this, "Construct did not validate: " + errors.join("\n"));
    }
  }
  public _beforeSynth() {}
  public _onSynth() {}
  public _synth(): void {}
  public _afterSynth() {}

  toString(): string {
    return `${this.constructor.name}(${this.node.path})`;
  }
}
