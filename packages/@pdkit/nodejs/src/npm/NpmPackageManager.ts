import { InstallShellScript, PackageManager, XConstruct } from "@pdkit/core/src";

export interface NodePackageManagerProps {
  readonly installCommand: string;
  readonly extraCommands?: string[];
}

export class NpmPackageManager extends PackageManager {
  constructor(scope: XConstruct, id: string, props: NodePackageManagerProps) {
    super(scope, id);

    new InstallShellScript(this, "InstallCommand", [props.installCommand]);
  }
}
