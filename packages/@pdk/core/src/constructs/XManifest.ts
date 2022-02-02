import { IXConstruct } from "./XConstruct";
import { Construct } from "constructs";
import deepmerge from "deepmerge";
import { XFile } from "./XFile";
import { XProject } from "./XProject";
import { XManifestEntry } from "./XManifestEntry";

export interface IXManifest extends IXConstruct {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;
}

export interface ManifestProps {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;
}

export class XManifest extends XFile implements IXManifest {
  public readonly path: string;
  protected fields: Record<string, unknown>;

  constructor(scope: Construct, id: string, props: ManifestProps) {
    super(scope, id, props);

    this.path = props.path;
    this.fields = {};

    this.node.addValidation({
      validate: (): string[] => {
        if (!this.fields) {
          return ["No data was written to file"];
        }

        return [];
      },
    });
  }

  public addFields(fields?: Record<string, unknown> | {}) {
    if (fields) {
      this.fields = deepmerge(this.fields, fields);
    }
  }

  public static is(construct: Construct) {
    return construct instanceof this;
  }

  get content() {
    const entries = XProject.of(this)
      .node.children.filter((c) => c instanceof XManifestEntry)
      .map((c) => c as XManifestEntry);

    for (const entry of entries) {
      this.addFields(entry.fields);
    }

    console.log(JSON.stringify(this.fields, null, 2));

    return JSON.stringify(this.fields, null, 2);
  }
}
