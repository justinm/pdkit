import { XConstruct } from "../../../core/src";
import { PostSynthTask } from "../../../core/src/constructs/PostSynthTask";

export interface NodePackageManagerProps {
  readonly installCommand: string;
}

export class NodePackageManager extends PostSynthTask {
  constructor(scope: XConstruct, id: string, props: NodePackageManagerProps) {
    super(scope, id, [props.installCommand]);
  }
}
