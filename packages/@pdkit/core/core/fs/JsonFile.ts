import { Construct } from "constructs";
import { Fields } from "../traits/Fields";
import { File, FileProps } from "./File";

export interface JsonFileProps extends Omit<FileProps, "content"> {
  readonly fields?: Record<string, unknown>;
}

/**
 * JsonFile represents a JSON JsonFile for a given project. Only one JsonFile may be present per project.
 */
export class JsonFile extends File {
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

  public addDeepFields(fields: Record<string, unknown>) {
    Fields.of(this).addDeepFields(fields);
  }

  public addShallowFields(fields: Record<string, unknown>) {
    Fields.of(this).addShallowFields(fields);
  }

  get content(): string {
    return JSON.stringify(Fields.of(this).fields, null, 2);
  }
}
