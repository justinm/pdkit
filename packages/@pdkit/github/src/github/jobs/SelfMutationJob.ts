import { XConstruct } from "@pdkit/core/src";
import { GithubJob, GithubJobProps, JobPermission } from "../../constructs/GithubJob";
import { GithubJobStep, GithubJobStepProps } from "../../constructs/GithubJobStep";
import { GithubCheckoutStep } from "../steps/GithubCheckoutStep";

export interface SelfMutationJobProps {
  buildJobName: string;
  job?: GithubJobProps;
  checkout?: GithubJobStepProps;
}

export class SelfMutationJob extends GithubJob {
  constructor(scope: XConstruct, id: string, props: SelfMutationJobProps) {
    super(scope, id, {
      name: "SelfMutation",
      permissions: {
        contents: JobPermission.WRITE,
      },
      needs: [props.buildJobName],
      runsOn: ["ubuntu-latest"],
      ...props?.job,
    });

    new GithubCheckoutStep(this, "Checkout", props?.checkout);

    new GithubJobStep(this, "Download", {
      name: "Download patch",
      uses: "actions/download-artifact@v2",
      with: {
        name: "${{ .repo.patch }}",
        path: "${{ runner.temp }}",
      },
    });

    new GithubJobStep(this, "Apply", {
      name: "Apply patch",
      run: '[ -s ${{ runner.temp }}/.repo.patch ] && git apply ${{ runner.temp }}/.repo.patch || echo "Empty patch. Skipping."',
    });

    new GithubJobStep(this, "Git", {
      name: "Configure git",
      run: 'git config user.name "github-actions && git config user.email "github-actions@github.com"',
    });

    new GithubJobStep(this, "Push", {
      name: "Push",
      run: 'git add . && git commit -s -m "chore: self mutation" && git push origin HEAD:${{ github.event.pull_request.head.ref }}',
    });
  }
}
