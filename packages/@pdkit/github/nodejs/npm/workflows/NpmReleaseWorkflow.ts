import { XConstruct } from "@pdkit/core";
import { ReleaseWorkflow, ReleaseWorkflowProps } from "../../../github/workflows/ReleaseWorkflow";
import { NpmInstallStep } from "../steps/NpmInstallStep";
import { NpmReleaseStep } from "../steps/NpmReleaseStep";

export interface NpmReleaseWorkflowProps extends ReleaseWorkflowProps {}

export class NpmReleaseWorkflow extends ReleaseWorkflow {
  constructor(scope: XConstruct, id: string, props: NpmReleaseWorkflowProps) {
    super(scope, id, { ...props, release: { installStep: NpmInstallStep, releaseStep: NpmReleaseStep } });
  }
}
