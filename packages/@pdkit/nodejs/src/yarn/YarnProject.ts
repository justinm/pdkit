import { XConstruct } from "../../../core/src";
import { NodeProjectProps, NpmProject } from "../npm/NpmProject";

export class YarnProject extends NpmProject {
  readonly berry: boolean = true;

  constructor(scope: XConstruct, id: string, props?: NodeProjectProps) {
    super(scope, id, {
      installCommand: "yarn",
      ...props,
    });
  }
}
