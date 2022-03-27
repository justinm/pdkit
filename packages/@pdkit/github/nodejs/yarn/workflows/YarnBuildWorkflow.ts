import { XConstruct } from "@pdkit/core";
import { BuildWorkflow, BuildWorkflowProps } from "../../../github/workflows/BuildWorkflow";
import { YarnBuildStep } from "../steps/YarnBuildStep";
import { YarnInstallStep } from "../steps/YarnInstallStep";

export interface YarnBuildWorkflowProps extends BuildWorkflowProps {
  nodeVersion?: string;
}

export class YarnBuildWorkflow extends BuildWorkflow {
  constructor(scope: XConstruct, id: string, props: YarnBuildWorkflowProps) {
    super(scope, id, {
      ...props,
      build: {
        installStep: YarnInstallStep,
        buildStep: YarnBuildStep,
        tools: { node: { version: props.nodeVersion ?? "14.x" } },
      },
    });
  }
}
