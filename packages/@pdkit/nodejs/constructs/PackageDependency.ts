import { ManifestEntry, XConstruct } from "@pdkit/core";

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
  private readonly keyName: string;
  constructor(scope: XConstruct, id: string, props?: PackageDependencyProps) {
    super(scope, `${id}Dependency`);

    switch (props?.type) {
      case PackageDependencyType.PEER:
        this.keyName = "peerDependencies";
        break;
      case PackageDependencyType.DEV:
        this.keyName = "devDependencies";
        break;
      case PackageDependencyType.BUNDLED:
        this.keyName = "bundledDependencies";
        break;
      default:
        this.keyName = "dependencies";
        break;
    }

    this.addFields({
      [this.keyName]: {
        [id]: props?.version ?? "*",
      },
    });
  }

  public setVersion(version: string) {
    this.addFields({
      [this.keyName]: {
        [this.node.id]: version,
      },
    });
  }
}
