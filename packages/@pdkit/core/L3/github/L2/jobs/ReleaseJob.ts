import { Construct } from "constructs";
import { GithubJob, GithubJobProps, JobPermission, Tools, GithubStep } from "../../L1";
import { CacheStep, GithubCheckoutStep } from "../steps";
import { SetupTools } from "./SetupTools";

export interface ReleaseJobProps extends Partial<GithubJobProps> {
  readonly cache?: Record<string, string>;
  readonly installStep: typeof GithubStep;
  readonly authStep?: typeof GithubStep;
  readonly buildStep?: typeof GithubStep;
  readonly releaseStep: typeof GithubStep;
  readonly codeCoverageStep?: typeof GithubStep;
  readonly uploadArtifactStep?: typeof GithubStep;
  readonly failOnMutation?: boolean;
  readonly commitMutations?: boolean;
  readonly tools: Tools;
}

export class ReleaseJob extends GithubJob {
  constructor(scope: Construct, id: string, props: ReleaseJobProps & Partial<GithubJobProps>) {
    super(scope, id, {
      name: "Release",
      permissions: {
        contents: JobPermission.WRITE,
      },
      runsOn: ["ubuntu-latest"],
      outputs: {
        latest_commit: {
          stepId: "Check",
          outputName: "latest_commit",
        },
      },
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
    if (props.buildStep) {
      new props.buildStep(this, "Build", { priority: 40 });
    }
    new props.releaseStep(this, "Release", { priority: 50 });

    new GithubStep(this, "Check", {
      priority: 60,
      name: "Check for new commits",
      run: 'echo ::set-output name=latest_commit::"$(git ls-remote origin -h ${{ github.ref }} | cut -f1)"',
    });
  }
}
