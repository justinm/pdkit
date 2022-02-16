import { ManifestEntry, XConstruct } from "@pdkit/core/src";

export interface PackageDependencyProps {
  readonly type?: PackageDependencyType;
  readonly version?: string;
}

export enum PackageDependencyType {
  DEV,
  PEER,
  BUNDLED,
}

export class PackageDependency extends ManifestEntry {
  constructor(scope: XConstruct, id: string, props?: PackageDependencyProps) {
    super(scope, `${id}Dependency`);

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

    this.addFields({
      [keyName]: {
        [id]: props?.version ?? "*",
      },
    });
  }
}
