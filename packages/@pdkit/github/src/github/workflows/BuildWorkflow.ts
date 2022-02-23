import { XConstruct } from "@pdkit/core/src";
import { GithubJob, JobPermission } from "../../constructs/GithubJob";
import { GithubJobStep } from "../../constructs/GithubJobStep";
import { GithubWorkflow, GithubWorkflowProps } from "../../constructs/GithubWorkflow";
import { FailOnSelfMutationStep } from "../steps/FailOnSelfMutationStep";
import { GithubCheckoutStep } from "../steps/GithubCheckoutStep";

export interface BuildWorkflowProps extends GithubWorkflowProps {
  readonly installStep: typeof GithubJobStep;
  readonly buildStep: typeof GithubJobStep;
  readonly codeCoverageStep?: typeof GithubJobStep;
  readonly uploadArtifactStep?: typeof GithubJobStep;
  readonly failOnMutation?: boolean;
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
    new props.installStep(job, "Install");
    new props.buildStep(job, "Build");

    if (props.codeCoverageStep) {
      new props.codeCoverageStep(job, "Coverage");
    }

    if (props.failOnMutation) {
      new FailOnSelfMutationStep(job, "SelfMutation");
    }
  }
}
