import { NodePackageManager } from "./constructs/NodePackageManager";
import { Construct } from "constructs";

export class YarnSupport extends NodePackageManager {
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      installCommand: "yarn",
    });
  }
}
