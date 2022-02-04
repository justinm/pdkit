import { Construct, IConstruct } from "constructs";
import { ConstructError } from "../util/ConstructError";

export interface IXConstruct extends IConstruct {
  _onSynth(): void;
  _synth(): void;
}

/**
 * The XConstruct, the base of all constructs for pdkit.
 */
export abstract class XConstruct extends Construct implements IXConstruct {
  constructor(scope: Construct, id: string) {
    super(scope, id.replace("/", "-"));
  }

  /**
   * Determines if the given argument is an XConstruct.
   *
   * @param construct
   */
  public static is(construct: any) {
    return construct instanceof this;
  }

  public _onSynth(): void {}
  public _synth(): void {
    const constructs = this.node.children.filter((c) => XConstruct.is(c)).map((c) => c as XConstruct);

    for (const construct of constructs) {
      const errors = construct.node.validate();

      if (errors.length) {
        throw new ConstructError(construct, "Construct did not validate: " + errors[0]);
      }

      construct._synth();
    }
  }
}
