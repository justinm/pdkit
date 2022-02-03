import { IXConstruct, XConstruct } from "./XConstruct";
import { Construct } from "constructs";
import deepmerge from "deepmerge";
import { XProject } from "./XProject";
import { XManifest } from "./XManifest";

export interface IXManifestEntryProps extends IXConstruct {
  readonly fields?: Record<string, unknown>;
}

/**
 * A ManifestEntry is an additional way of adding arbitrary fields to the projects
 * main manifest.
 */
export class XManifestEntry extends XConstruct implements IXManifestEntryProps {
  public fields: Record<string, unknown>;

  constructor(scope: Construct, id: string, fields?: Record<string, unknown>) {
    super(scope, id);

    this.fields = fields ?? {};

    this.node.addValidation({
      validate: (): string[] => {
        if (!this.fields) {
          return ["No data was written to file"];
        }

        const project = XProject.of(this);

        const siblings = project.node.children.filter((c) => c !== this && c instanceof XManifest);

        if (!siblings.length) {
          return ["No manifest was found in the project"];
        }

        if (siblings.length > 1) {
          return ["Only one manifest is allowed when using manifest entries"];
        }

        return [];
      },
    });
  }

  /**
   * Deepmerges the given fields with entries existing data
   * @param fields
   */
  public addFields(fields: Record<string, unknown> | {}) {
    this.fields = deepmerge(this.fields, fields);
  }

  public static is(construct: Construct) {
    return construct instanceof this;
  }

  _synthesize() {
    return this.fields;
  }
}
