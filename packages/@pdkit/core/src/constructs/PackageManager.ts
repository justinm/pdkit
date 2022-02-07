import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";

export abstract class PackageManager extends XConstruct {
  constructor(scope: XConstruct, id: string) {
    super(scope, id);

    Project.of(scope)._bind(this);
  }
}
