import { XConstruct } from "@pdkit/core/src/base/XConstruct";
import { BuildWorkflow, BuildWorkflowProps } from "../../../github/workflows/BuildWorkflow";
import { YarnBuildStep } from "../steps/YarnBuildStep";
import { YarnInstallStep } from "../steps/YarnInstallStep";

export interface YarnBuildWorkflowProps extends BuildWorkflowProps {}

export class YarnBuildWorkflow extends BuildWorkflow {
  constructor(scope: XConstruct, id: string, props: YarnBuildWorkflowProps) {
    super(scope, id, { ...props, setupStep: YarnInstallStep, buildStep: YarnBuildStep });
  }
}
