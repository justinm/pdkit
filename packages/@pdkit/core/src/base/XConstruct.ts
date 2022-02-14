import { Construct, IConstruct } from "constructs";
import { ConstructError } from "../util/ConstructError";
import logger from "../util/logger";

export interface IXConstruct extends IConstruct {
  readonly binds: IXConstruct[];

  _beforeSynth(): void;
  _synth(): void;
  _bind(construct: IXConstruct): void;
}

/**
 * The XConstruct, the base of all constructs for pdkit.
 */
export abstract class XConstruct extends Construct implements IXConstruct {
  private readonly _binds: IXConstruct[] = [];

  constructor(scope: XConstruct, id: string) {
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

  get binds() {
    return this._binds;
  }

  public _bind(construct: IXConstruct) {
    logger.debug(`${construct} bound itself to ${this}`);
    if (this._binds.indexOf(construct) !== -1) {
      throw new ConstructError(construct, `Construct was already bound to ${this.toString()}`);
    }

    this._binds.push(construct);
  }

  public _onBeforeSynth(): void {}

  public _beforeSynth(): void {
    const constructs = this.node.children.filter((c) => XConstruct.is(c)).map((c) => c as XConstruct);

    for (const construct of constructs) {
      construct._onBeforeSynth();
      construct._beforeSynth();
    }
  }

  public _onSynth(): void {}

  public _synth(): void {
    const constructs = this.node.children.filter((c) => XConstruct.is(c)).map((c) => c as XConstruct);

    for (const construct of constructs) {
      const errors = construct.node.validate();

      if (errors.length) {
        throw new ConstructError(construct, "Construct did not validate: " + errors[0]);
      }

      construct._onSynth();
      construct._synth();
    }
  }

  toString(): string {
    return `${this.constructor.name}(${this.node.path})`;
  }
}
