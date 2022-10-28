import { Construct } from "constructs";
import { NodeProject, NodeProjectProps, PackageManagerType } from "./index";

export interface YarnProjectProps extends Omit<NodeProjectProps, "github"> {
  readonly yalc?: boolean;
}

export class YarnProject extends NodeProject {
  constructor(scope: Construct, id: string, props?: YarnProjectProps) {
    super(scope, id, { ...props, packageManagerType: PackageManagerType.YARN });
  }
}
