import { randomUUID } from "crypto";
import { Construct } from "constructs";
import { Fields } from "../../../L1";
import { ManifestEntry } from "../../../L2";

export interface PackageDependencyProps {
  readonly type?: PackageDependencyType;
  readonly version?: string;
}

export enum PackageDependencyType {
  DEV,
  PEER,
  BUNDLED,
}

export class PackageDependency extends Construct {
  constructor(scope: Construct, packageName: string, props?: PackageDependencyProps) {
    super(scope, randomUUID());

    let keyName: string;

    switch (props?.type) {
      case PackageDependencyType.PEER:
        keyName = "peerDependencies";
        break;
      case PackageDependencyType.DEV:
        keyName = "devDependencies";
        break;
      case PackageDependencyType.BUNDLED:
        keyName = "bundledDependencies";
        break;
      default:
        keyName = "dependencies";
        break;
    }

    const entry = new ManifestEntry(this, "Default", {});

    switch (props?.type) {
      case PackageDependencyType.BUNDLED:
        Fields.of(entry).addDeepFields({ bundledDependencies: [packageName] });
        break;
      default:
        Fields.of(entry).addDeepFields({
          [keyName]: {
            [packageName]: props?.version ?? "*",
          },
        });
    }
  }
}
