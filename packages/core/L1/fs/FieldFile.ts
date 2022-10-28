import { Construct } from "constructs";
import { Fields } from "../traits";
import { File, FileProps } from "./File";

export interface FieldFileProps extends Omit<FileProps, "content"> {
  readonly fields?: Record<string, unknown>;
}

/**
 * A FieldFile is an abstract class capable of rendering dictionary style content to disk.
 *
 * See Also: {@link JsonFile} and {@link YamlFile}
 */
export abstract class FieldFile extends File {
  /**
   * Check if a given construct is a JsonFile.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }

  constructor(scope: Construct, id: string, props: FieldFileProps) {
    super(scope, id, props);

    Fields.implement(this, props.fields);
  }

  public addDeepFields(fields: Record<string, unknown>) {
    Fields.of(this).addDeepFields(fields);
  }

  public addShallowFields(fields: Record<string, unknown>) {
    Fields.of(this).addShallowFields(fields);
  }

  get fields() {
    return Fields.of(this).fields;
  }
}
