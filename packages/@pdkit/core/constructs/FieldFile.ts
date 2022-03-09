import { Construct } from "constructs";
import deepmerge from "deepmerge";
import { IXConstruct, XConstruct } from "../base/XConstruct";
import { File, FileProps } from "./File";

export interface IFieldFile extends IXConstruct {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;
}

export interface FieldFileProps extends Omit<FileProps, "append"> {
  readonly fields?: Record<string, unknown>;
}

/**
 * JsonFile represents a JSON JsonFile for a given project. Only one JsonFile may be present per project.
 */
export abstract class FieldFile extends File implements IFieldFile {
  /**
   * Check if a given construct is a JsonFile.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }

  protected _fields: Record<string, unknown>;

  constructor(scope: XConstruct, id: string, props: FieldFileProps) {
    super(scope, id, props);

    this._fields = {};

    this.node.addValidation({
      validate: (): string[] => {
        const errors: string[] = [];

        if (!Object.keys(this._fields).length) {
          errors.push("The file does not contain any data to write");
        }

        return errors;
      },
    });
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

  /**
   * Returns the calculated content for the JsonFile.
   */
  get content() {
    return this.transform(this.fields);
  }

  protected abstract transform(fields: Record<string, unknown>): string;
}
