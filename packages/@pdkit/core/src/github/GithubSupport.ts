import { XConstruct } from "../base/XConstruct";
import { Project } from "../Project";

export class GithubSupport extends XConstruct {
  constructor(scope: XConstruct, id: string) {
    super(scope, id);

    Project.of(this)._bind(this);
  }
}
