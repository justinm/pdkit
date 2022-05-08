import { Construct } from "constructs";
import { ManifestEntry } from "../../../L2";
import { NodeProject, NodeProjectProps, PackageManagerType } from "./index";

export interface YarnProjectProps extends Omit<NodeProjectProps, "github"> {
  readonly yalc?: boolean;
}

export class YarnProject extends NodeProject {
  constructor(scope: Construct, id: string, props?: YarnProjectProps) {
    super(scope, id, { ...props, packageManagerType: PackageManagerType.YARN, github: undefined });

    if (props?.yalc) {
      new ManifestEntry(this, "Yalc", {
        workspaces: [".yalc/*", ".yalc/*/*"],
      });
    }
  }
}
