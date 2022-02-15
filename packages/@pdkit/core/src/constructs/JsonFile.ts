import { Construct } from "constructs";
import deepmerge from "deepmerge";
import { IXConstruct, XConstruct } from "../base/XConstruct";
import { File } from "./File";
import { Project } from "../Project";

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
  protected fields: Record<string, unknown>;

  constructor(scope: XConstruct, id: string, path: string) {
    super(scope, id, path);

    this.fields = {};

    Project.of(this)._bind(this);

    this.node.addValidation({
      validate: (): string[] => {
        const errors: string[] = [];

        if (!Object.keys(this.fields).length) {
          errors.push("The file does not contain any data to write");
        }

        return errors;
      },
    });
  }

  /**
   * Deep merge new fields into the constructing JsonFile. Existing fields may be overwritten by this call.
   *
   * @param fields
   */
  public addFields(fields: Record<string, unknown> | {}) {
    this.fields = deepmerge(this.fields, fields);
  }

  /**
   * Returns the calculated content for the JsonFile.
   */
  get content() {
    return JSON.stringify(this.fields, null, 2);
  }

  /**
   * Check if a given construct is a JsonFile.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }
}
