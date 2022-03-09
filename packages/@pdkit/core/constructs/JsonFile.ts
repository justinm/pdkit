import { Construct } from "constructs";
import { XConstruct } from "../base/XConstruct";
import { FieldFile, FieldFileProps, IFieldFile } from "./FieldFile";

/**
 * JsonFile represents a JSON JsonFile for a given project. Only one JsonFile may be present per project.
 */
export class JsonFile extends FieldFile implements IFieldFile {
  /**
   * Check if a given construct is a JsonFile.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }

  constructor(scope: XConstruct, id: string, props: FieldFileProps) {
    super(scope, id, props);
  }

  protected transform(fields: Record<string, unknown>): string {
    return JSON.stringify(fields, null, 2);
  }
}
