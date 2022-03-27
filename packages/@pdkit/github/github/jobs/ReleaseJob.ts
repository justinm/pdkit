import { XConstruct } from "@pdkit/core";
import { GithubJob, GithubJobProps, JobPermission } from "../../constructs/GithubJob";
import { GithubJobStep } from "../../constructs/GithubJobStep";
import { CacheStep } from "../steps/CacheStep";
import { GithubCheckoutStep } from "../steps/GithubCheckoutStep";

export interface ReleaseJobProps extends Partial<GithubJobProps> {
  readonly cache?: Record<string, string>;
  readonly installStep: typeof GithubJobStep;
  readonly releaseStep: typeof GithubJobStep;
  readonly codeCoverageStep?: typeof GithubJobStep;
  readonly uploadArtifactStep?: typeof GithubJobStep;
  readonly failOnMutation?: boolean;
  readonly commitMutations?: boolean;
}

export class ReleaseJob extends GithubJob {
  constructor(scope: XConstruct, id: string, props: ReleaseJobProps & Partial<GithubJobProps>) {
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

    new props.installStep(this, "Install", { priority: 20 });
    new props.releaseStep(this, "Release", { priority: 30 });

    new GithubJobStep(this, "Check", {
      priority: 40,
      name: "Check for new commits",
      run: 'echo ::set-output name=latest_commit::"$(git ls-remote origin -h ${{ github.ref }} | cut -f1)"',
    });
  }
}