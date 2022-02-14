import { ManifestEntry } from "../../../core/src/constructs/ManifestEntry";
import { Project } from "../../../core/src";

export interface PackageDependencyProps {
  readonly type?: PackageDependencyType;
  readonly version?: string;
}

export enum PackageDependencyType {
  DEV,
  PEER,
}

export class PackageDependency extends ManifestEntry {
  constructor(scope: Project, id: string, props?: PackageDependencyProps) {
    super(scope, `${id}Dependency`);

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
