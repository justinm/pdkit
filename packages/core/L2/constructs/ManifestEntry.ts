import { Construct, IConstruct } from "constructs";
import { Project, Bindings, Fields } from "../../L1";

export interface IManifestEntry extends IConstruct {
  readonly fields?: Record<string, unknown>;
  readonly propagate?: boolean;
}

export interface ManifestEntryProps {
  readonly propagate?: boolean;
  readonly shallow?: boolean;
}

/**
 * A ManifestEntry is an additional way of adding arbitrary fields to the projects
 * main manifest.
 */
export class ManifestEntry extends Construct implements IManifestEntry {
  public static is(construct: any) {
    return construct instanceof this;
  }

  public readonly propagate: boolean;
  public readonly shallow: boolean;

  constructor(scope: Construct, id: string, fields: Record<string, unknown>, props?: ManifestEntryProps) {
    super(scope, id);

    this.propagate = props?.propagate ?? false;
    this.shallow = props?.shallow ?? false;

    Fields.implement(this);
    Fields.of(this).addDeepFields(fields);
    Bindings.of(Project.of(this)).bind(this);
  }
}
