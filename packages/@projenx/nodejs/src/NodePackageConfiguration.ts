import { XManifest } from "../../core/src/constructs/XManifest";
import { Construct } from "constructs";

export interface NodePackageConfigurationProps {
  readonly description?: string;
  readonly homepath?: string;
  readonly repository?: string;
  readonly dependencies?: string[];
  readonly devDependencies?: string[];
  readonly peerDependencies?: string[];
  readonly keywords?: string[];
  readonly main?: string;
  readonly bin?: Record<string, string>;
  readonly scripts?: Record<string, string>;
  readonly bugs?: {
    readonly url?: string;
    readonly email?: string;
  };
  readonly files?: string[];
  readonly man?: string[];
}

export class NodePackageConfiguration extends XManifest {
  constructor(scope: Construct, id: string, props?: NodePackageConfigurationProps) {
    super(scope, id, { path: "package.json" });

    console.log("Package props", props);

    if (props) {
      this.addFields(props);
    }
  }
}
