import { Construct } from "constructs";
import { GithubJob, GithubJobProps, JobPermission, Tools, GithubStep } from "../../L1";
import { CacheStep, FailOnSelfMutationStep, FindSelfMutationStep, GithubCheckoutStep } from "../steps";
import { SelfMutationJob } from "./SelfMutationJob";
import { SetupTools } from "./SetupTools";

export interface BuildJobProps extends Partial<GithubJobProps> {
  readonly cache?: Record<string, string>;
  readonly installStep: typeof GithubStep;
  readonly buildStep: typeof GithubStep;
  readonly codeCoverageStep?: typeof GithubStep;
  readonly uploadArtifactStep?: typeof GithubStep;
  readonly failOnMutation?: boolean;
  readonly commitMutations?: boolean;
  readonly tools: Tools;
}

export class BuildJob extends GithubJob {
  constructor(scope: Construct, id: string, props: BuildJobProps & Partial<GithubJobProps>) {
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

    if (props.cache) {
      Object.keys(props.cache).forEach((c) => {
        new CacheStep(this, "Cache", {
          path: (props.cache as any)[c],
          key: c,
        });
      });
    }

    new SetupTools(this, "SetupTools", { ...props, priority: 20 });
    new props.installStep(this, "Install", { priority: 30 });
    new props.buildStep(this, "Build", { priority: 40 });

    if (props.codeCoverageStep) {
      new props.codeCoverageStep(this, "Coverage", { priority: 50 });
    }

    new FindSelfMutationStep(this, "FindSelfMutation", { priority: 60 });

    if (props.failOnMutation) {
      new FailOnSelfMutationStep(this, "SelfMutation", { priority: 70 });
    }

    if (props.commitMutations && !props.failOnMutation) {
      new SelfMutationJob(scope, "SelfMutation", {
        priority: 60,
        buildJobName: "Build",
      });
    }
  }
}
