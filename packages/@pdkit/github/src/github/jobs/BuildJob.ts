import { XConstruct } from "@pdkit/core/src";
import { GithubJob, GithubJobProps, JobPermission } from "../../constructs/GithubJob";
import { GithubJobStep } from "../../constructs/GithubJobStep";
import { FailOnSelfMutationStep } from "../steps/FailOnSelfMutationStep";
import { GithubCheckoutStep } from "../steps/GithubCheckoutStep";
import { SelfMutationJob } from "./SelfMutationJob";

export interface BuildJobProps {
  readonly installStep: typeof GithubJobStep;
  readonly buildStep: typeof GithubJobStep;
  readonly codeCoverageStep?: typeof GithubJobStep;
  readonly uploadArtifactStep?: typeof GithubJobStep;
  readonly failOnMutation?: boolean;
  readonly commitMutations?: boolean;
}

export class BuildJob extends GithubJob {
  constructor(scope: XConstruct, id: string, props: BuildJobProps & Partial<GithubJobProps>) {
    super(scope, id, {
      name: "Build",
      permissions: {
        contents: JobPermission.WRITE,
      },
      runsOn: ["ubuntu-latest"],
      ...props,
    });

    new GithubCheckoutStep(this, "Checkout");
    new props.installStep(this, "Install");
    new props.buildStep(this, "Build");

    if (props.codeCoverageStep) {
      new props.codeCoverageStep(this, "Coverage");
    }

    if (props.failOnMutation) {
      new FailOnSelfMutationStep(this, "SelfMutation");
    } else if (props.commitMutations) {
      new SelfMutationJob(this, "SelfMutation", {
        buildJobName: "Build",
      });
    }
  }
}
