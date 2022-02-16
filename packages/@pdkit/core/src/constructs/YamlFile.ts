import { Construct } from "constructs";
import deepmerge from "deepmerge";
import yaml from "js-yaml";
import { IXConstruct, XConstruct } from "../base/XConstruct";
import { File } from "./File";

export interface IYamlFile extends IXConstruct {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;
}

/**
 * A YamlFile represents a YAML file for a given project.
 */
export class YamlFile extends File implements IYamlFile {
  /**
   * Check if a given construct is a YamlFile.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }

  protected fields: Record<string, unknown>;

  constructor(scope: XConstruct, id: string, path: string) {
    super(scope, id, path);

    this.fields = {};

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
   * Deep merge new fields into the constructing YamlFile. Existing fields may be overwritten by this call.
   *
   * @param fields
   */
  public addFields(fields: Record<string, unknown> | {}) {
    this.fields = deepmerge(this.fields, fields);
  }

  /**
   * Returns the calculated content for the YamlFile.
   */
  get content() {
    return yaml.dump(this.fields, { lineWidth: 120 });
  }
}
