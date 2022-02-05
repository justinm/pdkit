import { Construct } from "constructs";
import deepmerge from "deepmerge";
import { ConstructError } from "../util/ConstructError";
import { ManifestEntry } from "./ManifestEntry";
import { IXConstruct, XConstruct } from "../base/XConstruct";
import { File } from "./File";
import { Project } from "../Project";

export interface IManifest extends IXConstruct {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;
}

/**
 * Manifest represents a JSON manifest for a given project. Only one manifest may be present per project.
 */
export class Manifest extends File implements IManifest {
  protected fields: Record<string, unknown>;

  constructor(scope: XConstruct, id: string, path: string) {
    super(scope, id, path);

    this.fields = {};

    Project.of(this)._bind(this);

    this.node.addValidation({
      validate: (): string[] => {
        const errors: string[] = [];
        const siblings = Project.of(this).binds.filter((p) => p instanceof Manifest && p !== this);

        if (siblings.length > 1) {
          errors.push("Only one manifest is allowed when using manifest entries");
        }

        if (!this.fields) {
          errors.push("The manifest does not contain any data to write");
        }

        return errors;
      },
    });
  }

  /**
   * Deep merge new fields into the constructing manifest. Existing fields may be overwritten by this call.
   *
   * @param fields
   */
  public addFields(fields: Record<string, unknown> | {}) {
    this.fields = deepmerge(this.fields, fields);
  }

  /**
   * Returns the calculated content for the manifest.
   */
  get content() {
    const parentManifests = this.node.scopes
      .filter((s) => Project.is(s))
      .map((m) =>
        (m as Project).binds.filter((e) => e instanceof ManifestEntry && e.propagate).map((e) => e as Manifest)
      )
      .flat();

    for (const entry of parentManifests) {
      if (entry.fields) {
        this.addFields(entry.fields);
      }
    }

    return JSON.stringify(this.fields, null, 2);
  }

  /**
   * Check if a given construct is a Manifest.
   *
   * @param construct
   */
  public static is(construct: Construct) {
    return construct instanceof this;
  }

  public static of(construct: Construct): Manifest {
    const project = Project.of(construct);
    const manifest = project.binds.find((c) => c instanceof Manifest);

    if (!manifest) {
      throw new ConstructError(construct, "No manifest was found");
    }

    return manifest as Manifest;
  }
}
