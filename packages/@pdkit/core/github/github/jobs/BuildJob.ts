import { XConstruct } from "../../../core";
import { GithubJob, GithubJobProps, JobPermission, Tools } from "../../constructs/GithubJob";
import { GithubJobStep } from "../../constructs/GithubJobStep";
import { CacheStep } from "../steps/CacheStep";
import { FailOnSelfMutationStep } from "../steps/FailOnSelfMutationStep";
import { GithubCheckoutStep } from "../steps/GithubCheckoutStep";
import { SelfMutationJob } from "./SelfMutationJob";
import { SetupTools } from "./SetupTools";

export interface BuildJobProps extends Partial<GithubJobProps> {
  readonly cache?: Record<string, string>;
  readonly installStep: typeof GithubJobStep;
  readonly buildStep: typeof GithubJobStep;
  readonly codeCoverageStep?: typeof GithubJobStep;
  readonly uploadArtifactStep?: typeof GithubJobStep;
  readonly failOnMutation?: boolean;
  readonly commitMutations?: boolean;
  readonly tools: Tools;
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

    if (props.failOnMutation) {
      new FailOnSelfMutationStep(this, "SelfMutation", { priority: 60 });
    } else if (props.commitMutations) {
      new SelfMutationJob(this, "SelfMutation", {
        priority: 60,
        buildJobName: "Build",
      });
    }
  }
}
