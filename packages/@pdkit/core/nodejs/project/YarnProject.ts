import { Construct } from "constructs";
import { ManifestEntry } from "../../core";
import { YarnGithubSupport, YarnGithubSupportProps } from "../../github";
import { NodeProject, NodeProjectProps, PackageManagerType } from "./index";

export interface YarnProjectProps extends Omit<NodeProjectProps, "github"> {
  readonly yalc?: boolean;
  readonly github?: YarnGithubSupportProps;
}

export class YarnProject extends NodeProject {
  constructor(scope: Construct, id: string, props?: YarnProjectProps) {
    super(scope, id, { ...props, packageManagerType: PackageManagerType.YARN, github: undefined });

    if (props?.yalc) {
      new ManifestEntry(this, "Yalc", {
        workspaces: [".yalc/*", ".yalc/*/*"],
      });
    }

    if (props?.github) {
      new YarnGithubSupport(this, props.github);
    }
  }
}
