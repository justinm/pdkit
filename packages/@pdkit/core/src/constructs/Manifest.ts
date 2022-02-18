import { Construct } from "constructs";
import deepmerge from "deepmerge";
import { IXConstruct, XConstruct } from "../base/XConstruct";
import { Project } from "../Project";
import { ConstructError } from "../util/ConstructError";
import { JsonFile } from "./JsonFile";
import { ManifestEntry } from "./ManifestEntry";

export interface IManifest extends IXConstruct {
  /**
   * Specify the entries path relative to the project root
   */
  readonly path: string;
}

/**
 * Manifest represents a JSON manifest for a given project. Only one manifest may be present per project.
 */
export class Manifest extends JsonFile implements IManifest {
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
    const manifest = project.node.findAll().find((c) => c instanceof Manifest);

    if (!manifest) {
      throw new ConstructError(construct, `No manifest was found in project ${project.node.id}`);
    }

    return manifest as Manifest;
  }

  constructor(scope: XConstruct, id: string, path: string) {
    super(scope, id, { path });

    this.node.addValidation({
      validate: (): string[] => {
        const errors: string[] = [];
        const siblings = Project.of(this)
          .node.findAll()
          .filter((p) => p instanceof Manifest && p !== this);

        if (siblings.length > 1) {
          errors.push("Only one manifest is allowed when using manifest entries");
        }

        return errors;
      },
    });
  }

  /**
   * Returns the calculated content for the manifest.
   */
  get content() {
    const project = Project.of(this);
    let fields = this.fields;

    const parentManifests = this.node.scopes
      .filter((s) => Project.is(s) && s !== project)
      .map((p) => Manifest.of(p))
      .map((m) => m.binds.filter((e) => e instanceof ManifestEntry && e.propagate))
      .flat() as ManifestEntry[];

    for (const entry of parentManifests) {
      if (entry.fields) {
        fields = deepmerge(fields, entry.fields);
      }
    }

    const entries = this.binds.filter((b) => b instanceof ManifestEntry) as ManifestEntry[];

    for (const entry of entries) {
      fields = deepmerge(fields, entry.fields);
    }

    return JSON.stringify(fields, null, 2);
  }
}
