import { XManifest } from "../../../core/src/xconstructs/XManifest";
import { Construct } from "constructs";

export type Dependencies = string[] | { [key: string]: string };

export interface NodePackageJsonProps {
  readonly name?: string;
  readonly description?: string;
  readonly private?: boolean;
  readonly homepath?: string;
  readonly repository?: string;
  readonly dependencies?: Dependencies;
  readonly devDependencies?: Dependencies;
  readonly peerDependencies?: Dependencies;
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

export class NodePackageJson extends XManifest {
  constructor(scope: Construct, id: string, props?: NodePackageJsonProps) {
    super(scope, id, { path: "package.json" });

    if (props) {
      this.addFields(props);
    }
  }
}
