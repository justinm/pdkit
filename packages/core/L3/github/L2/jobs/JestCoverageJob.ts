import { Construct } from "constructs";
import { GithubJob, GithubJobProps, JobPermission, GithubStep, GithubJobStepProps } from "../../L1";
import { GithubCheckoutStep } from "../steps";

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

    new GithubStep(this, "Download", {
      name: "Report",
      uses: "ArtiomTr/jest-coverage-report-action@v2",
    });
  }
}
