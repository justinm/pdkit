import { NodePackageManager } from "./constructs/NodePackageManager";
import { Construct } from "constructs";

export class YarnSupport extends NodePackageManager {
  readonly berry: boolean = true;
  constructor(scope: Construct, id: string) {
    super(scope, id, {
      installCommand: "yarn",
    });
  }
}
