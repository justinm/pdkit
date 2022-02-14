import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";
import { Script } from "../scripts/Script";

export abstract class PackageManager extends Script {
  constructor(scope: XConstruct, id: string) {
    super(scope, id);

    Project.of(scope)._bind(this);
  }
}
