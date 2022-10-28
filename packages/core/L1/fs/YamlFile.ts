import { Construct } from "constructs";
import YAML from "js-yaml";
import { Fields } from "../traits";
import { FieldFile } from "./FieldFile";
import { FileProps } from "./File";

export interface YamlFileProps extends Omit<FileProps, "content"> {
  readonly fields?: Record<string, unknown>;
}

/**
 * YamlFile represents a Yaml YamlFile for a given project. Only one YamlFile may be present per project.
 */
export class YamlFile extends FieldFile {
  /**
   * Check if a given construct is a YamlFile.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }

  constructor(scope: Construct, id: string, props: YamlFileProps) {
    super(scope, id, props);

    Fields.implement(this, props.fields);
  }

  get content(): string {
    return YAML.dump(Fields.of(this).fields);
  }
}
