import { XConstruct } from "../../../core/src";

export interface XPackageManagerProps {
  readonly installCommand: string;
}

export class NodePackageManager extends XConstruct {
  readonly installCommand: string;

  constructor(scope: XConstruct, id: string, props: XPackageManagerProps) {
    super(scope, id);

    this.installCommand = props.installCommand;
  }
}
