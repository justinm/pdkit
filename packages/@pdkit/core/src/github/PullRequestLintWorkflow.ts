import { XConstruct } from "../base/XConstruct";
import { GithubWorkflow, Job, JobPermission } from "./GithubWorkflow";

/**
 * Options for PullRequestLint
 */
export interface PullRequestLintWorkflowProps {
  /**
   * Validate that pull request titles follow Conventional Commits.
   *
   * @default true
   * @see https://www.conventionalcommits.org/
   */
  readonly semanticTitle?: boolean;

  /**
   * Options for validating the conventional commit title linter.
   * @default - title must start with "feat", "fix", or "chore"
   */
  readonly semanticTitleOptions?: SemanticTitleOptions;

  /**
   * Github Runner selection labels
   * @default ["ubuntu-latest"]
   */
  readonly runsOn?: string[];
}

/**
 * Options for linting that PR titles follow Conventional Commits.
 * @see https://www.conventionalcommits.org/
 */
export interface SemanticTitleOptions {
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
  constructor(scope: XConstruct, id: string, props?: PullRequestLintWorkflowProps) {
    // should only create a workflow if one or more linters are enabled
    if (props?.semanticTitle ?? true) {
      const opts = props?.semanticTitleOptions ?? {};
      const types = opts.types ?? ["feat", "fix", "chore"];

      const validateJob: Job = {
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
              requireScope: opts.requireScope ?? false,
            },
          },
        ],
      };

      super(scope, id, {
        events: {
          pullRequestTarget: {
            types: ["labeled", "opened", "synchronize", "reopened", "ready_for_review", "edited"],
          },
        },
        jobs: { validate: validateJob },
      });
    }
  }
}
