import { Construct } from "constructs";
import yaml from "js-yaml";
import { Fields } from "../traits/Fields";
import { LifeCycle, LifeCycleStage } from "../traits/Lifecycle";
import { File, FileProps } from "./File";

export interface YamlFileProps extends Omit<FileProps, "content"> {
  readonly fields: Record<string, unknown>;
}

/**
 * A YamlFile represents a YAML file for a given project.
 */
export class YamlFile extends Construct {
  /**
   * Check if a given construct is a YamlFile.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }

  constructor(scope: Construct, id: string, props: YamlFileProps) {
    super(scope, id);

    Fields.implement(this, props?.fields);

    LifeCycle.implement(this);
    LifeCycle.of(this).on(LifeCycleStage.BEFORE_WRITE, () => {
      new File(this, "Default", { ...props, content: this.content });
    });
  }

  get content() {
    return yaml.dump(Fields.of(this), { lineWidth: 120, noRefs: true });
  }
}
