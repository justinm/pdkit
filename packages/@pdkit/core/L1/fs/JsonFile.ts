import { Construct } from "constructs";
import { Fields } from "../traits";
import { FieldFile } from "./FieldFile";
import { FileProps } from "./File";

export interface JsonFileProps extends Omit<FileProps, "content"> {
  readonly fields?: Record<string, unknown>;
}

/**
 * JsonFile represents a JSON JsonFile for a given project. Only one JsonFile may be present per project.
 */
export class JsonFile extends FieldFile {
  /**
   * Check if a given construct is a JsonFile.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }

  constructor(scope: Construct, id: string, props: JsonFileProps) {
    super(scope, id, props);

    Fields.implement(this, props.fields);
  }

  get content(): string {
    return JSON.stringify(Fields.of(this).fields, null, 2);
  }
}
