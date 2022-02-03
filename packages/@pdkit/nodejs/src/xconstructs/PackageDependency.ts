import { Construct } from "constructs";
import { XManifestEntry } from "../../../core/src/xconstructs/XManifestEntry";

export interface PackageDependencyProps {
  readonly version?: string;
}

export class PackageDependency extends XManifestEntry {
  readonly version: string;

  constructor(scope: Construct, id: string, props?: PackageDependencyProps) {
    super(scope, id, {});

    this.version = props?.version ?? "*";
  }
}
