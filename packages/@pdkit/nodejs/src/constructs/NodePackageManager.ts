import { XConstruct } from "../../../core/src";
import { PackageManager } from "../../../core/src/constructs/PackageManager";
import { InstallScript } from "../../../core/src/scripts/InstallScript";

export interface NodePackageManagerProps {
  readonly installCommand: string;
  readonly extraCommands?: string[];
}

export class NodePackageManager extends PackageManager {
  constructor(scope: XConstruct, id: string, props: NodePackageManagerProps) {
    super(scope, id);

    new InstallScript(this, "InstallCommand", [props.installCommand]);
  }
}
