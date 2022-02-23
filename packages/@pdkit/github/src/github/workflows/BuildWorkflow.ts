import { XConstruct } from "@pdkit/core/src";
import { GithubJob, JobPermission } from "../../constructs/GithubJob";
import { GithubJobStep } from "../../constructs/GithubJobStep";
import { GithubWorkflow, GithubWorkflowProps } from "../../constructs/GithubWorkflow";
import { FailOnSelfMutationStep } from "../steps/FailOnSelfMutationStep";
import { GithubCheckoutStep } from "../steps/GithubCheckoutStep";
import { UploadArtifactStep, UploadArtifactStepProps } from "../steps/UploadArtifactStep";

export interface BuildWorkflowProps extends GithubWorkflowProps, UploadArtifactStepProps {
  setupStep: typeof GithubJobStep;
  buildStep: typeof GithubJobStep;
  codeCoverageStep?: typeof GithubJobStep;
  uploadArtifactStep?: typeof GithubJobStep;
}

export class BuildWorkflow extends GithubWorkflow {
  constructor(scope: XConstruct, id: string, props: BuildWorkflowProps) {
    super(scope, id, {
      events: {
        pullRequest: {},
        workflowDispatch: {},
      },
      ...props,
    });

    const job = new GithubJob(this, "build", {
      name: "Build",
      permissions: {
        contents: JobPermission.WRITE,
      },
      runsOn: ["ubuntu-latest"],
    });

    new GithubCheckoutStep(job, "Checkout");
    new props.setupStep(job, "Setup");
    new props.buildStep(job, "Build");

    if (props.codeCoverageStep) {
      new props.codeCoverageStep(job, "Coverage");
    }

    new FailOnSelfMutationStep(job, "SelfMutation");
    new UploadArtifactStep(job, "UploadArtifact", props);
  }
}
