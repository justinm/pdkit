import { ManifestEntry, XConstruct } from "../../core";

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
  private readonly type?: PackageDependencyType;

  constructor(scope: XConstruct, id: string, props?: PackageDependencyProps) {
    super(scope, `Dependency${props?.type}-${id}`);

    this.type = props?.type;

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

    switch (props?.type) {
      case PackageDependencyType.BUNDLED:
        this.addFields({ bundledDependencies: [id] });
        break;
      default:
        this.addFields({
          [this.keyName]: {
            [id]: props?.version ?? "*",
          },
        });
    }
  }

  public setVersion(version: string) {
    if (this.type !== PackageDependencyType.BUNDLED) {
      this.addFields({
        [this.keyName]: {
          [this.node.id]: version,
        },
      });
    }
  }
}
