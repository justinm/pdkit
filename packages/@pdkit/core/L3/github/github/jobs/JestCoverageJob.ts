import { Construct } from "constructs";
import { GithubJob, GithubJobProps, JobPermission } from "../../constructs/GithubJob";
import { GithubJobStep, GithubJobStepProps } from "../../constructs/GithubJobStep";
import { GithubCheckoutStep } from "../steps/GithubCheckoutStep";

export interface JestCoverageJobProps extends Partial<GithubJobProps> {
  readonly job?: GithubJobProps;
  readonly checkout?: GithubJobStepProps;
}

export class JestCoverageJob extends GithubJob {
  constructor(scope: Construct, id: string, props: JestCoverageJobProps) {
    super(scope, id, {
      name: "Coverage",
      permissions: {
        contents: JobPermission.WRITE,
      },
      runsOn: ["ubuntu-latest"],
      ...props?.job,
    });

    new GithubCheckoutStep(this, "Checkout", props?.checkout);

    new GithubJobStep(this, "Download", {
      name: "Report",
      uses: "ArtiomTr/jest-coverage-report-action@v2",
    });
  }
}
