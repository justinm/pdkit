import { Construct } from "constructs";
import { File, Project } from "../../../L1";
import { SemanticPullRequestLintWorkflowProps, PullRequestLintWorkflow } from "../github/workflows/PullRequestLintWorkflow";

export interface GithubSupportProps {
  readonly pullRequestLint?: Omit<SemanticPullRequestLintWorkflowProps, "runsOn">;
  readonly pullRequestTemplate?: string;
}

export class GithubSupport extends Construct {
  constructor(scope: Project, id: string, props?: GithubSupportProps) {
    super(scope, id);

    if (props?.pullRequestLint) {
      new PullRequestLintWorkflow(this, "pull-request-lint", props?.pullRequestLint);
    }

    if (props?.pullRequestTemplate) {
      new File(this, "PullRequestTemplate", { filePath: ".github/pull_request_template.md", content: props.pullRequestTemplate });
    }
  }
}
