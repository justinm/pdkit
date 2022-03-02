import { XConstruct } from "@pdkit/core/src";
import { GithubJob, GithubJobProps, JobPermission } from "../../constructs/GithubJob";
import { GithubJobStep } from "../../constructs/GithubJobStep";
import { FailOnSelfMutationStep } from "../steps/FailOnSelfMutationStep";
import { GithubCheckoutStep } from "../steps/GithubCheckoutStep";
import { SelfMutationJob } from "./SelfMutationJob";

export interface BuildJobProps extends Partial<GithubJobProps> {
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
      priority: 10,
      ...props,
    });

    new GithubCheckoutStep(this, "Checkout", { priority: 10 });
    new props.installStep(this, "Install", { priority: 20 });
    new props.buildStep(this, "Build", { priority: 10 });

    if (props.codeCoverageStep) {
      new props.codeCoverageStep(this, "Coverage", { priority: 30 });
    }

    if (props.failOnMutation) {
      new FailOnSelfMutationStep(this, "SelfMutation", { priority: 40 });
    } else if (props.commitMutations) {
      new SelfMutationJob(this, "SelfMutation", {
        priority: 20,
        buildJobName: "Build",
      });
    }
  }
}
