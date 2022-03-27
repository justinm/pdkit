import { XConstruct } from "@pdkit/core";
import { BuildWorkflow, BuildWorkflowProps } from "../../../github/workflows/BuildWorkflow";
import { NpmBuildStep } from "../steps/NpmBuildStep";
import { NpmInstallStep } from "../steps/NpmInstallStep";

export interface NpmBuildWorkflowProps extends BuildWorkflowProps {
  nodeVersion?: string;
}

export class NpmBuildWorkflow extends BuildWorkflow {
  constructor(scope: XConstruct, id: string, props: NpmBuildWorkflowProps) {
    super(scope, id, {
      ...props,
      build: {
        installStep: NpmInstallStep,
        buildStep: NpmBuildStep,
        tools: { node: { version: props.nodeVersion ?? "14.x" } },
      },
    });
  }
}
