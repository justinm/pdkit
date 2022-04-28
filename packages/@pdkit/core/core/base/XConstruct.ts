import { Construct, IConstruct } from "constructs";

export type Constructor<T> = abstract new (...args: any[]) => any;
export type Callback = () => void;

export enum LifeCycle {
  VALIDATE = "Validate",
  BEFORE_SYNTH = "BeforeSynth",
  SYNTH = "Synth",
  AFTER_SYNTH = "AfterSynth",
  BEFORE_WRITE = "BeforeWrite",
  WRITE = "Write",
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

  private readonly lifecycle: Record<LifeCycle, Callback[]>;

  constructor(scope: XConstruct, id: string) {
    super(scope, id.replace("/", "-"));

    this.lifecycle = {
      Validate: [],
      BeforeSynth: [],
      Synth: [],
      AfterSynth: [],
      BeforeWrite: [],
      Write: [],
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

  /**
   * Find all nodes by type that are owned by this project. Ownership is determined by the closest project scoped to a node.
   * @param childType
   */
  public tryFindDeepChildren<T extends Constructor<any> = Constructor<any>, TRet extends InstanceType<T> = InstanceType<T>>(
    childType: T
  ): TRet[] {
    return this.node.findAll().filter((c) => c instanceof childType) as TRet[];
  }

  /**
   * Find all nodes by type that are owned by this project. Ownership is determined by the closest project scoped to a node.
   * Undefined is returned if the number of matching children is not exactly one.
   * @param childType
   */
  public tryFindDeepChild<T extends Constructor<any> = Constructor<any>, TRet extends InstanceType<T> = InstanceType<T>>(
    childType: T
  ): TRet | undefined {
    const children = this.tryFindDeepChildren(childType);

    return (children.length === 1 && children[0]) || undefined;
  }

  /**
   * Find all nodes by type that are owned by this project. Ownership is determined by the closest project scoped to a node.
   * An error is thrown if the number of matching children is not exactly one.
   * @param childType
   */
  public findDeepChild<T extends Constructor<any> = Constructor<any>, TRet extends InstanceType<T> = InstanceType<T>>(childType: T): TRet {
    const child = this.tryFindDeepChild(childType);

    if (!child) {
      throw new Error(`${this}: Project does not own a ${childType}`);
    }

    return child;
  }
}
