import { Construct } from "constructs";
import { XConstruct } from "../../../core/src/constructs/XConstruct";

export interface XPackageManagerProps {
  readonly installCommand: string;
}

export class NodePackageManager extends XConstruct {
  readonly installCommand: string;

  constructor(scope: Construct, id: string, props: XPackageManagerProps) {
    super(scope, id);

    this.installCommand = props.installCommand;
  }
}
