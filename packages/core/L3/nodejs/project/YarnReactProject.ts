import { Construct } from "constructs";
import { ManifestEntry } from "../../../L2";
import { ReactSupport, ReactSupportProps } from "../tools/ReactSupport";
import { YarnProject, YarnProjectProps } from "./YarnProject";

export interface YarnReactProjectProps extends YarnProjectProps, ReactSupportProps {}

export class YarnReactProject extends YarnProject {
  constructor(scope: Construct, id: string, props?: YarnReactProjectProps) {
    super(scope, id, props);

    new ReactSupport(this, props);

    if (props?.scripts) {
      new ManifestEntry(this, "YarnReactEnsureScripts", { scripts: props.scripts });
    }
  }
}
