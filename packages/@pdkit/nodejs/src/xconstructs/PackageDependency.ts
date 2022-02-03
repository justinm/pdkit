import { Construct } from "constructs";
import { XManifestEntry } from "../../../core/src/xconstructs/XManifestEntry";

export interface PackageDependencyProps {
  readonly type?: PackageDependencyType;
  readonly version?: string;
}

export enum PackageDependencyType {
  DEV,
  PEER,
}

export class PackageDependency extends XManifestEntry {
  constructor(scope: Construct, id: string, props?: PackageDependencyProps) {
    super(scope, id);

    let keyName: string;
    switch (props?.type) {
      case PackageDependencyType.PEER:
        keyName = "peerDependencies";
        break;
      case PackageDependencyType.DEV:
        keyName = "devDependencies";
        break;
      default:
        keyName = "dependencies";
        break;
    }

    this.addFields({
      [keyName]: {
        [id]: props?.version ?? "*",
      },
    });
  }
}
