import { Construct } from "constructs";
import deepmerge from "deepmerge";
import { IXConstruct, XConstruct } from "../base/XConstruct";
import { File, FileProps } from "./File";

export interface IJsonFile extends IXConstruct {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;
}

/**
 * JsonFile represents a JSON JsonFile for a given project. Only one JsonFile may be present per project.
 */
export class JsonFile extends File implements IJsonFile {
  /**
   * Check if a given construct is a JsonFile.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }

  protected _fields: Record<string, unknown>;

  constructor(scope: XConstruct, id: string, props: Omit<FileProps, "append">) {
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
  public addFields(fields: Record<string, unknown> | {}) {
    this._fields = deepmerge(this._fields, fields);
  }

  /**
   * Returns the calculated content for the JsonFile.
   */
  get content() {
    return JSON.stringify(this._fields, null, 2);
  }
}
