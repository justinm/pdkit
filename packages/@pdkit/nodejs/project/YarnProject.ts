import { ManifestEntry, XConstruct } from "@pdkit/core";
import { NodeProject, NodeProjectProps, PackageManagerType } from "./index";

export interface YarnProjectProps extends NodeProjectProps {
  readonly yalc?: boolean;
}

export class YarnProject extends NodeProject {
  constructor(scope: XConstruct, id: string, props?: YarnProjectProps) {
    super(scope, id, { ...props, packageManagerType: PackageManagerType.YARN });

    if (props?.yalc) {
      new ManifestEntry(this, "Yalc", {
        workspaces: [".yalc/*", ".yalc/*/*"],
      });
    }
  }
}
