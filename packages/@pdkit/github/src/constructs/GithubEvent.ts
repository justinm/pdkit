/**
 * CRON schedule options.
 */
export interface CronScheduleOptions {
  /**
   * @see https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07
   */
  readonly cron: string;
}

/**
 * Repository dispatch options.
 */
export interface RepositoryDispatchOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: string[];
}

/**
 * Branch Protection Rule options
 */
export interface BranchProtectionRuleOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"created" | "edited" | "deleted">;
}

/**
 * Check run options.
 */
export interface CheckRunOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"create" | "rerequested" | "completed" | "requested_action">;
}

/**
 * Check suite options
 */
export interface CheckSuiteOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"completed" | "requested" | "rerequested">;
}

/**
 * Discussion options
 */
export interface DiscussionOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<
    | "created"
    | "edited"
    | "transferred"
    | "pinned"
    | "unpinned"
    | "labeled"
    | "unlabeled"
    | "locked"
    | "unlocked"
    | "category_changed"
    | "answered"
    | "unanswered"
  >;
}

/**
 * Discussion comment options
 */
export interface DiscussionCommentOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"created" | "edited" | "deleted">;
}

/**
 * Issue comment options
 */
export interface IssueCommentOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"created" | "edited" | "deleted">;
}

/**
 * Issues options
 */
export interface IssuesOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<
    | "opened"
    | "edited"
    | "deleted"
    | "transferred"
    | "pinned"
    | "unpinned"
    | "closed"
    | "reopened"
    | "assigned"
    | "unassigned"
    | "labeled"
    | "unlabeled"
    | "locked"
    | "unlocked"
    | "milestoned"
    | "demilestoned"
  >;
}

/**
 * label options
 */
export interface LabelOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"created" | "edited" | "deleted">;
}

/**
 * Milestone options
 */
export interface MilestoneOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"created" | "closed" | "opened" | "edited" | "deleted">;
}

/**
 * Project options
 */
export interface ProjectOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"created" | "updated" | "closed" | "reopened" | "edited" | "deleted">;
}

/**
 * Project card options
 */
export interface ProjectCardOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"created" | "moved" | "converted" | "edited" | "deleted">;
}

/**
 * Probject column options
 */
export interface ProjectColumnOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"created" | "updated" | "moved" | "deleted">;
}

/**
 * Pull request options
 */
export interface PullRequestOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<
    | "assigned"
    | "unassigned"
    | "labeled"
    | "unlabeled"
    | "opened"
    | "edited"
    | "closed"
    | "reopened"
    | "synchronize"
    | "ready_for_review"
    | "locked"
    | "unlocked"
    | "review_requested"
    | "review_request_removed"
  >;
}

/**
 * Pull request review options
 */
export interface PullRequestReviewOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"submitted" | "edited" | "dismissed">;
}

/**
 * Pull request review comment options
 */
export interface PullRequestReviewCommentOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"created" | "edited" | "deleted">;
}

/**
 * Pull request target options.
 */
export interface PullRequestTargetOptions extends PushOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<
    | "assigned"
    | "unassigned"
    | "labeled"
    | "unlabeled"
    | "opened"
    | "edited"
    | "closed"
    | "reopened"
    | "synchronize"
    | "ready_for_review"
    | "locked"
    | "unlocked"
    | "review_requested"
    | "review_request_removed"
  >;
}

/**
 * Options for push-like events.
 */
export interface PushOptions {
  /**
   * When using the push and pull_request events, you can configure a workflow
   * to run on specific branches or tags. For a pull_request event, only
   * branches and tags on the base are evaluated. If you define only tags or
   * only branches, the workflow won't run for events affecting the undefined
   * Git ref.
   *
   * @see https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet
   */
  readonly branches?: string[];

  /**
   * When using the push and pull_request events, you can configure a workflow
   * to run on specific branches or tags. For a pull_request event, only
   * branches and tags on the base are evaluated. If you define only tags or
   * only branches, the workflow won't run for events affecting the undefined
   * Git ref.
   *
   * @see https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet
   */
  readonly tags?: string[];

  /**
   * When using the push and pull_request events, you can configure a workflow
   * to run when at least one file does not match paths-ignore or at least one
   * modified file matches the configured paths. Path filters are not
   * evaluated for pushes to tags.
   *
   * @see https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#filter-pattern-cheat-sheet
   */
  readonly paths?: string[];
}

/**
 * Registry package options
 */
export interface RegistryPackageOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"published" | "updated">;
}

/**
 * Release options
 */
export interface ReleaseOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"published" | "unpublished" | "created" | "edited" | "deleted" | "prereleased" | "released">;
}

/**
 * Watch options
 */
export interface WatchOptions {
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"started">;
}

/**
 * Workflow run options
 */
export interface WorkflowRunOptions {
  /**
   * Which workflow to trigger on.
   *
   * @defaults - any workflows
   */
  readonly workflows?: Array<string>;
  /**
   * Which activity types to trigger on.
   *
   * @defaults - all activity types
   */
  readonly types?: Array<"completed" | "requested">;
  /**
   * Which branches or branch-ignore to limit the trigger to.
   *
   * @defaults - no branch limits
   */
  readonly branches?: Array<string>;
}

//#region Empty Options (future-proofing the API)
/**
 * The Workflow dispatch event accepts no options.
 */
export interface WorkflowDispatchOptions {}

/**
 * The Workflow Call event accepts no options.
 */
export interface WorkflowCallOptions {}

/**
 * The Create event accepts no options.
 */
export interface CreateOptions {}

/**
 * The Delete event accepts no options.
 */
export interface DeleteOptions {}

/**
 * The Deployment event accepts no options.
 */
export interface DeploymentOptions {}

/**
 * The Deployment status event accepts no options.
 */
export interface DeploymentStatusOptions {}

/**
 * The Fork event accepts no options.
 */
export interface ForkOptions {}

/**
 * The Gollum event accepts no options.
 */
export interface GollumOptions {}

/**
 * The Page build event accepts no options.
 */
export interface PageBuildOptions {}

/**
 * The Public event accepts no options.
 */
export interface PublicOptions {}

/**
 * The Status event accepts no options.
 */
export interface StatusOptions {}

/**
 * The set of available triggers for GitHub Workflows.
 *
 * @see https://docs.github.com/en/actions/reference/events-that-trigger-workflows
 */
export interface GithubEventProps {
  //#region Scheduled events
  /**
   * You can schedule a workflow to run at specific UTC times using POSIX cron
   * syntax. Scheduled workflows run on the latest commit on the default or
   * base branch. The shortest interval you can run scheduled workflows is
   * once every 5 minutes.
   *
   * @see https://pubs.opengroup.org/onlinepubs/9699919799/utilities/crontab.html#tag_20_25_07
   */
  readonly schedule?: CronScheduleOptions[];
  //#endregion

  //#region Manual events
  /**
   * You can configure custom-defined input properties, default input values,
   * and required inputs for the event directly in your workflow. When the
   * workflow runs, you can access the input values in the github.event.inputs
   * context.
   */
  readonly workflowDispatch?: WorkflowDispatchOptions;

  /**
   * You can use the GitHub API to trigger a webhook event called
   * repository_dispatch when you want to trigger a workflow for activity that
   * happens outside of GitHub.
   */
  readonly repositoryDispatch?: RepositoryDispatchOptions;
  //#endregion

  //#region Workflow reuse events
  /**
   * Can be called from another workflow
   * @see https://docs.github.com/en/actions/learn-github-actions/reusing-workflows
   */
  readonly workflowCall?: WorkflowCallOptions;
  //#endregion

  //#region Webhook events
  /**
   * Runs your workflow anytime the branch_protection_rule event occurs.
   */
  readonly branchProtectionRule?: BranchProtectionRuleOptions;

  /**
   * Runs your workflow anytime the check_run event occurs.
   */
  readonly checkRun?: CheckRunOptions;

  /**
   * Runs your workflow anytime the check_suite event occurs.
   */
  readonly checkSuite?: CheckSuiteOptions;

  /**
   * Runs your workflow anytime someone creates a branch or tag, which
   * triggers the create event.
   */
  readonly create?: CreateOptions;

  /**
   * Runs your workflow anytime someone deletes a branch or tag, which
   * triggers the delete event.
   */
  readonly delete?: DeleteOptions;

  /**
   * Runs your workflow anytime someone creates a deployment, which triggers
   * the deployment event. Deployments created with a commit SHA may not have
   * a Git ref.
   */
  readonly deployment?: DeploymentOptions;

  /**
   * Runs your workflow anytime a third party provides a deployment status,
   * which triggers the deployment_status event. Deployments created with a
   * commit SHA may not have a Git ref.
   */
  readonly deploymentStatus?: DeploymentStatusOptions;

  /**
   * Runs your workflow anytime the discussion event occurs. More than one activity type triggers this event.
   * @see https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions
   */
  readonly discussion?: DiscussionOptions;

  /**
   * Runs your workflow anytime the discussion_comment event occurs. More than one activity type triggers this event.
   * @see https://docs.github.com/en/graphql/guides/using-the-graphql-api-for-discussions
   */
  readonly discussionComment?: DiscussionCommentOptions;

  /**
   * Runs your workflow anytime when someone forks a repository, which
   * triggers the fork event.
   */
  readonly fork?: ForkOptions;

  /**
   * Runs your workflow when someone creates or updates a Wiki page, which
   * triggers the gollum event.
   */
  readonly gollum?: GollumOptions;

  /**
   * Runs your workflow anytime the issue_comment event occurs.
   */
  readonly issueComment?: IssueCommentOptions;

  /**
   * Runs your workflow anytime the issues event occurs.
   */
  readonly issues?: IssuesOptions;

  /**
   * Runs your workflow anytime the label event occurs.
   */
  readonly label?: LabelOptions;

  /**
   * Runs your workflow anytime the milestone event occurs.
   */
  readonly milestone?: MilestoneOptions;

  /**
   * Runs your workflow anytime someone pushes to a GitHub Pages-enabled
   * branch, which triggers the page_build event.
   */
  readonly pageBuild?: PageBuildOptions;

  /**
   * Runs your workflow anytime the project event occurs.
   */
  readonly project?: ProjectOptions;

  /**
   * Runs your workflow anytime the project_card event occurs.
   */
  readonly projectCard?: ProjectCardOptions;

  /**
   * Runs your workflow anytime the project_column event occurs.
   */
  readonly projectColumn?: ProjectColumnOptions;

  /**
   * Runs your workflow anytime someone makes a private repository public,
   * which triggers the public event.
   */
  readonly public?: PublicOptions;

  /**
   * Runs your workflow anytime the pull_request event occurs.
   */
  readonly pullRequest?: PullRequestOptions;

  /**
   * Runs your workflow anytime the pull_request_review event occurs.
   */
  readonly pullRequestReview?: PullRequestReviewOptions;

  /**
   * Runs your workflow anytime a comment on a pull request's unified diff is
   * modified, which triggers the pull_request_review_comment event.
   */
  readonly pullRequestReviewComment?: PullRequestReviewCommentOptions;

  /**
   * This event runs in the context of the base of the pull request, rather
   * than in the merge commit as the pull_request event does. This prevents
   * executing unsafe workflow code from the head of the pull request that
   * could alter your repository or steal any secrets you use in your workflow.
   * This event allows you to do things like create workflows that label and
   * comment on pull requests based on the contents of the event payload.
   *
   * WARNING: The `pull_request_target` event is granted read/write repository
   * token and can access secrets, even when it is triggered from a fork.
   * Although the workflow runs in the context of the base of the pull request,
   * you should make sure that you do not check out, build, or run untrusted
   * code from the pull request with this event. Additionally, any caches
   * share the same scope as the base branch, and to help prevent cache
   * poisoning, you should not save the cache if there is a possibility that
   * the cache contents were altered.
   *
   * @see https://securitylab.github.com/research/github-actions-preventing-pwn-requests
   */
  readonly pullRequestTarget?: PullRequestTargetOptions;

  /**
   * Runs your workflow when someone pushes to a repository branch, which
   * triggers the push event.
   */
  readonly push?: PushOptions;

  /**
   * Runs your workflow anytime a package is published or updated.
   */
  readonly registryPackage?: RegistryPackageOptions;

  /**
   * Runs your workflow anytime the release event occurs.
   */
  readonly release?: ReleaseOptions;

  /**
   * Runs your workflow anytime the status of a Git commit changes, which
   * triggers the status event.
   */
  readonly status?: StatusOptions;

  /**
   * Runs your workflow anytime the watch event occurs.
   */
  readonly watch?: WatchOptions;

  /**
   * This event occurs when a workflow run is requested or completed, and
   * allows you to execute a workflow based on the finished result of another
   * workflow. A workflow run is triggered regardless of the result of the
   * previous workflow.
   */
  readonly workflowRun?: WorkflowRunOptions;
  //#endregion
}
