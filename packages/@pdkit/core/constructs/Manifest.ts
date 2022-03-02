import { Construct } from "constructs";
import deepmerge from "deepmerge";
import { IXConstruct, XConstruct } from "../base/XConstruct";
import { ConstructError } from "../util/ConstructError";
import { JsonFile } from "./JsonFile";
import { ManifestEntry } from "./ManifestEntry";
import { Project } from "./Project";

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
    const manifest = project.tryFindDeepChildren(Manifest)[0];

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
          .tryFindDeepChildren(Manifest)
          .filter((m) => m !== this);

        if (siblings.length) {
          errors.push("Only one manifest is allowed per project");
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
      .map((p) => (p as Project).tryFindDeepChildren(ManifestEntry).filter((entry) => entry.propagate))
      .flat();

    for (const entry of parentManifests) {
      if (entry.fields) {
        fields = deepmerge(fields, entry.fields);
      }
    }

    const entries = project.tryFindDeepChildren(ManifestEntry);

    for (const entry of entries) {
      fields = deepmerge(fields, entry.fields);
    }

    return JSON.stringify(fields, null, 2);
  }
}
