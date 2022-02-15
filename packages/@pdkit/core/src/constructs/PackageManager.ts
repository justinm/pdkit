import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";
import { ShellScript } from "../scripts/ShellScript";

export abstract class PackageManager extends ShellScript {
  constructor(scope: XConstruct, id: string) {
    super(scope, id);

    Project.of(scope)._bind(this);
  }
}
