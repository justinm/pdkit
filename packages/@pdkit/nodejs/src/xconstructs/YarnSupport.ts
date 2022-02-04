import { NodePackageManager } from "./NodePackageManager";
import { XConstruct } from "../../../core/src";

export class YarnSupport extends NodePackageManager {
  readonly berry: boolean = true;

  constructor(scope: XConstruct, id: string) {
    super(scope, id, {
      installCommand: "yarn",
    });
  }
}
