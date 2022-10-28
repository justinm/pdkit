import { Construct, IConstruct } from "constructs";
import { logger } from "../../util/logger";

export interface IBindings {}

export type AcceptBindingCallback = (construct: Construct) => void;
export type AcceptChildCallback = (construct: Construct) => void;
type Constructor<T> = abstract new (...args: any[]) => any;

const BINDINGS_SYMBOL = Symbol.for("@stackgen/core/core/traits/Bindings");

export class Bindings implements IBindings {
  public static implement<T extends Construct>(
    instance: IBindings,
    callbacks?: { onAcceptBinding?: AcceptBindingCallback; onAcceptChild?: AcceptChildCallback }
  ) {
    (instance as any)[BINDINGS_SYMBOL] = new Bindings(instance as T, callbacks);
  }

  public static of(instance: IBindings): Bindings {
    const ret = this.tryOf(instance);
    if (!ret) {
      throw new Error(`${instance} does not implement IBindings. Use "Bindings.implement()" to implement`);
    }

    return ret;
  }

  public static tryOf(instance: IBindings): Bindings {
    return (instance as any)[BINDINGS_SYMBOL];
  }

  private readonly owner: Construct;
  private readonly items: Construct[] = [];
  private readonly symbols: Record<symbol, Construct> = {};
  private readonly onAcceptBinding?: AcceptBindingCallback;
  private readonly onAcceptChild?: AcceptChildCallback;
  private _index: number = 0;

  constructor(owner: Construct, callbacks?: { onAcceptBinding?: AcceptBindingCallback; onAcceptChild?: AcceptChildCallback }) {
    this.owner = owner;
    this.onAcceptBinding = callbacks?.onAcceptBinding;
    this.onAcceptChild = callbacks?.onAcceptChild;

    owner.node.scopes.forEach((scope) => {
      const callback = Bindings.tryOf(scope)?.onAcceptChild;

      if (callback) {
        callback(owner);
      }
    });
  }

  public bind(object: Construct, unique?: boolean) {
    const sym = Symbol.for(typeof object);

    const existing = this.symbols[sym];

    if (existing) {
      throw new Error(`Only one ${typeof object} may exist per ${this.owner} and has already been mounted by ${existing}`);
    }

    if (this.items.indexOf(object) !== -1) {
      throw new Error(`Construct ${object} attempted to bind multiple times to ${this.owner}`);
    }

    this.items.splice(this._index++, 0, object);

    logger.silly(`${object} bound itself to ${this.owner} at index ${this._index}`);

    if (unique) {
      this.symbols[sym] = object;
    }

    if (this.onAcceptBinding) {
      this.onAcceptBinding(object);
    }

    return this;
  }

  /**
   * @param id
   */
  public before(id: string | IConstruct): Bindings {
    let idToUse: string;

    if (typeof id === "string") {
      idToUse = id;
    } else {
      idToUse = id.node.id;
    }
    const index = this.items.findIndex((j) => j.node.id === idToUse);

    if (index === -1) {
      throw new Error(`Could not find id/name of ${id}`);
    }

    this._index = index;

    return this;
  }

  /**
   * @param id
   */
  public after(id: string | IConstruct): Bindings {
    let idToUse: string;

    if (typeof id === "string") {
      idToUse = id;
    } else {
      idToUse = id.node.id;
    }
    const index = this.items.findIndex((j) => j.node.id === idToUse);

    if (index === -1) {
      throw new Error(`Could not find id/name of ${idToUse}`);
    }

    this._index = index + 1;

    return this;
  }

  /**
   * Resets the insertion index to the beginning
   */
  public reset(): Bindings {
    this._index = 0;

    return this;
  }

  /**
   * Resets the insertion index to the end
   */
  public end(): Bindings {
    this._index = this.items.length;

    return this;
  }

  public all() {
    return this.items;
  }

  public find<T extends Construct>(searchable: (value: T, index: number, obj: T[]) => unknown): T | undefined {
    return (this.items as T[]).find(searchable);
  }

  public findByClass<T extends Construct, C extends Constructor<T> = Constructor<T>>(cls: C): T | undefined {
    return this.items.find((i) => i instanceof cls) as T | undefined;
  }

  public filter<T extends Construct>(searchable: (value: T, index: number, array: T[]) => unknown): Construct[] {
    return (this.items as T[]).filter(searchable);
  }

  public filterByClass<T extends Construct, C extends Constructor<T>>(cls: C): InstanceType<C>[] {
    return this.items.filter((i) => i instanceof cls) as InstanceType<C>[];
  }

  public map<T extends Construct>(searchable: (construct: T) => boolean) {
    return (this.items as T[]).map(searchable);
  }
}
