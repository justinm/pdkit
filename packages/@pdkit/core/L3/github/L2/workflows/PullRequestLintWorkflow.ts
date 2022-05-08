import { Construct } from "constructs";
import { GithubJob, GithubJobImplProps, JobPermission, GithubWorkflow, GithubWorkflowProps } from "../../L1";

/**
 * Options for SemanticPullRequestLintWorkflow
 */
export interface SemanticPullRequestLintWorkflowProps extends GithubWorkflowProps, GithubJobImplProps {
  /**
   * Enable pull request title validation workflow
   */
  readonly enabled?: boolean;
  /**
   * Configure a list of commit types that are allowed.
   * @default ["feat", "fix", "chore"]
   */
  readonly types?: string[];

  /**
   * Configure that a scope must always be provided.
   * e.g. feat(ui), fix(core)
   * @default false
   */
  readonly requireScope?: boolean;
}

export class PullRequestLintWorkflow extends GithubWorkflow {
  constructor(scope: Construct, id: string, props?: SemanticPullRequestLintWorkflowProps) {
    super(scope, id, {
      events: {
        pullRequestTarget: {
          types: ["labeled", "opened", "synchronize", "reopened", "ready_for_review", "edited"],
        },
      },
    });

    const types = props?.types ?? ["feat", "fix", "chore"];

    new GithubJob(this, "validate", {
      name: "Validate PR title",
      runsOn: props?.runsOn ?? ["ubuntu-latest"],
      permissions: {
        pullRequests: JobPermission.WRITE,
      },
      steps: [
        {
          uses: "amannn/action-semantic-pull-request@v3.4.6",
          env: {
            GITHUB_TOKEN: "${{ secrets.GITHUB_TOKEN }}",
          },
          with: {
            types: types.join("\n"),
            requireScope: props?.requireScope ?? false,
          },
        },
      ],
    });
  }
}
