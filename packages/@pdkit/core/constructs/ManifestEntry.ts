import deepmerge from "deepmerge";
import { IXConstruct, XConstruct } from "../base/XConstruct";

export interface IManifestEntry extends IXConstruct {
  readonly fields?: Record<string, unknown>;
  readonly propagate?: boolean;
}

/**
 * A ManifestEntry is an additional way of adding arbitrary fields to the projects
 * main manifest.
 */
export class ManifestEntry extends XConstruct implements IManifestEntry {
  public static is(construct: any) {
    return construct instanceof this;
  }

  public fields: Record<string, unknown>;
  public propagate: boolean;

  constructor(scope: XConstruct, id: string, fields?: Record<string, unknown>, propagate?: boolean) {
    super(scope, id);

    this.fields = fields ?? {};
    this.propagate = propagate ?? false;

    this.node.addValidation({
      validate: (): string[] => {
        const errors: string[] = [];

        if (!Object.keys(this.fields).length) {
          errors.push("The manifest entry contains no fields");
        }

        return errors;
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
}
