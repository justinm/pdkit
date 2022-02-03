import { IXConstruct } from "./XConstruct";
import { Construct } from "constructs";
import deepmerge from "deepmerge";
import { XFile } from "./XFile";
import { XProject } from "./XProject";
import { XManifestEntry } from "./XManifestEntry";
import { XInheritableManifestEntry } from "./XInheritableManifestEntry";

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

/**
 * XManifest represents a JSON manifest for a given project. Only one manifest may be present per project.
 */
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

  /**
   * Deep merge new fields into the constructing manifest. Existing fields may be overwritten by this call.
   *
   * @param fields
   */
  public addFields(fields?: Record<string, unknown> | {}) {
    if (fields) {
      this.fields = deepmerge(this.fields, fields);
    }
  }

  public static is(construct: Construct) {
    return construct instanceof this;
  }

  /**
   * Returns the calculated content for the manifest.
   */
  get content() {
    const parentManifests = this.node.scopes
      .filter((s) => XProject.is(s))
      .map((s) => s as XProject)
      .map((s) =>
        s.node.children.filter((c) => XInheritableManifestEntry.is(c)).map((c) => c as XInheritableManifestEntry)
      )
      .flat();

    const entries = XProject.of(this)
      .node.children.filter((c) => c instanceof XManifestEntry)
      .map((c) => c as XManifestEntry);

    for (const entry of parentManifests.concat(entries)) {
      this.addFields(entry.fields);
    }

    console.log(JSON.stringify(this.fields, null, 2));

    return JSON.stringify(this.fields, null, 2);
  }
}
