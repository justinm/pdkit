import { Construct } from "constructs";
import deepmerge from "deepmerge";

export interface IFields {}

const FIELDS_SYMBOL = Symbol.for("@stackgen/core/core/traits/Fields");

export class Fields implements IFields {
  public static implement<T extends Construct>(instance: IFields, fields?: Record<string, unknown>) {
    (instance as any)[FIELDS_SYMBOL] = new Fields(instance as T, fields);
  }

  public static of(instance: IFields): Fields {
    const ret = this.tryOf(instance);
    if (!ret) {
      throw new Error(`${instance} does not implement IFields. Use "Fields.implement()" to implement`);
    }

    return ret;
  }

  public static tryOf(instance: IFields): Fields {
    return (instance as any)[FIELDS_SYMBOL];
  }

  public readonly owner: Construct;
  private _fields: Record<string, unknown>;

  constructor(owner: Construct, fields?: Record<string, unknown>) {
    this.owner = owner;
    this._fields = fields ?? {};
  }

  public orderFields(order: string[]) {
    this._fields = Object.keys(this._fields)
      .sort((a, b) => {
        if (order.indexOf(a) !== -1 && order.indexOf(b) === -1) {
          return -1;
        }
        if (order.indexOf(a) === -1 && order.indexOf(b) !== -1) {
          return 1;
        }
        return order.indexOf(a) - order.indexOf(b);
      })
      .reduce((c, k) => {
        c[k] = this._fields[k];

        return c;
      }, {} as Record<string, unknown>);
  }

  get fields() {
    return this._fields;
  }

  /**
   * Deep merge new fields into the constructing JsonFile. Existing fields may be overwritten by this call.
   *
   * @param fields
   */
  public addDeepFields(fields: Record<string, unknown> | {}) {
    this._fields = deepmerge(this._fields, fields, {
      arrayMerge: (target, source) => {
        return target.concat(source).reduce((coll, el) => {
          if (!coll.filter((s: unknown) => s === el).length) {
            coll.push(el);
          }

          return coll;
        }, []);
      },
    });
  }

  /**
   * Shallow merge new fields into the constructing JsonFile. Existing fields may be overwritten by this call.
   *
   * @param fields
   */
  public addShallowFields(fields: Record<string, unknown> | {}) {
    for (const key of Object.keys(fields)) {
      this._fields[key] = fields[key as keyof typeof fields];
    }
  }
}
