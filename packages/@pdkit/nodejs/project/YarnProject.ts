import { XConstruct } from "@pdkit/core";
import { NodeProject, NodeProjectProps, PackageManagerType } from "./index";

export interface YarnProjectProps extends NodeProjectProps {}

export class YarnProject extends NodeProject {
  constructor(scope: XConstruct, id: string, props?: YarnProjectProps) {
    super(scope, id, { ...props, packageManagerType: PackageManagerType.YARN });
  }
}
