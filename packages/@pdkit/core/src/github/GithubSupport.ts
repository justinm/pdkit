import { XConstruct } from "../base/XConstruct";
import { File } from "../constructs/File";
import { PullRequestLintWorkflowProps, PullRequestLintWorkflow } from "./PullRequestLintWorkflow";

export interface GithubSupportProps {
  pullRequestLint?: boolean;
  pullRequestLintProps?: PullRequestLintWorkflowProps;
  pullRequestTemplate?: string;
}

export class GithubSupport extends XConstruct {
  constructor(scope: XConstruct, id: string, props?: GithubSupportProps) {
    super(scope, id);

    if (props?.pullRequestLint) {
      new PullRequestLintWorkflow(this, "pull-request-lint", props?.pullRequestLintProps);
    }

    if (props?.pullRequestTemplate) {
      new File(this, "PullRequestTemplate", { path: ".github/pull_request_template.md" }).writeFile(
        props.pullRequestTemplate
      );
    }
  }
}
