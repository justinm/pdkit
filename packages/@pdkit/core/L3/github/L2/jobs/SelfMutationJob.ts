import { Construct } from "constructs";
import { GithubJob, GithubJobProps, JobPermission, GithubStep, GithubJobStepProps } from "../../L1";
import { GithubCheckoutStep } from "../steps";

export interface SelfMutationJobProps extends Partial<GithubJobProps> {
  readonly buildJobName: string;
  readonly job?: GithubJobProps;
  readonly checkout?: GithubJobStepProps;
}

export class SelfMutationJob extends GithubJob {
  constructor(scope: Construct, id: string, props: SelfMutationJobProps) {
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

    new GithubStep(this, "Download", {
      name: "Download patch",
      uses: "actions/download-artifact@v2",
      with: {
        name: "${{ .repo.patch }}",
        path: "${{ runner.temp }}",
      },
    });

    new GithubStep(this, "Apply", {
      name: "Apply patch",
      run: '[ -s ${{ runner.temp }}/.repo.patch ] && git apply ${{ runner.temp }}/.repo.patch || echo "Empty patch. Skipping."',
    });

    new GithubStep(this, "Git", {
      name: "Configure git",
      run: 'git config user.name "github-actions && git config user.email "github-actions@github.com"',
    });

    new GithubStep(this, "Push", {
      name: "Push",
      run: 'git add . && git commit -s -m "chore: self mutation" && git push origin HEAD:${{ github.event.pull_request.head.ref }}',
    });
  }
}
