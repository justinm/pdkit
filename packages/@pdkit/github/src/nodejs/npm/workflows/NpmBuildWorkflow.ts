import { XConstruct } from "@pdkit/core/src/base/XConstruct";
import { BuildWorkflow, BuildWorkflowProps } from "../../../github/workflows/BuildWorkflow";
import { NpmBuildStep } from "../steps/NpmBuildStep";
import { NpmInstallStep } from "../steps/NpmInstallStep";

export interface NpmBuildWorkflowProps extends BuildWorkflowProps {}

export class NpmBuildWorkflow extends BuildWorkflow {
  constructor(scope: XConstruct, id: string, props: NpmBuildWorkflowProps) {
    super(scope, id, { ...props, setupStep: NpmInstallStep, buildStep: NpmBuildStep });
  }
}
