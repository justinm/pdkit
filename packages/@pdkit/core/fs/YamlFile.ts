import { Construct } from "constructs";
import yaml from "js-yaml";
import { XConstruct } from "../base/XConstruct";
import { FieldFile, FieldFileProps } from "./FieldFile";
import { IFile } from "./File";

/**
 * A YamlFile represents a YAML file for a given project.
 */
export class YamlFile extends FieldFile implements IFile {
  /**
   * Check if a given construct is a YamlFile.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }

  constructor(scope: XConstruct, filePath: string, props?: FieldFileProps) {
    super(scope, filePath, props);
  }

  protected transform(fields: Record<string, unknown>) {
    return yaml.dump(fields, { lineWidth: 120, noRefs: true });
  }
}
