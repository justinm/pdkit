import { XConstruct } from "../base/XConstruct";
import { ShellScript } from "../scripts/ShellScript";

export abstract class PackageManager extends ShellScript {
  constructor(scope: XConstruct, id: string) {
    super(scope, id);
  }
}
