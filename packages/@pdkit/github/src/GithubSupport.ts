import { Workspace } from "@pdkit/core/src";
import { XConstruct } from "@pdkit/core/src/base/XConstruct";
import { File } from "@pdkit/core/src/constructs/File";
import { BuildWorkflow, BuildWorkflowProps } from "./github/workflows/BuildWorkflow";
import {
  SemanticPullRequestLintWorkflowProps,
  PullRequestLintWorkflow,
} from "./github/workflows/PullRequestLintWorkflow";

export interface GithubSupportProps {
  pullRequestLint?: Omit<SemanticPullRequestLintWorkflowProps, "runsOn">;
  pullRequestTemplate?: string;
  buildWorkflow?: BuildWorkflowProps & {
    enabled: boolean;
  };
}

export class GithubSupport extends XConstruct {
  constructor(scope: Workspace, id: string, props?: GithubSupportProps) {
    super(scope, id);

    if (props?.pullRequestLint) {
      new PullRequestLintWorkflow(this, "pull-request-lint", props?.pullRequestLint);
    }

    if (props?.pullRequestTemplate) {
      new File(this, "PullRequestTemplate", { path: ".github/pull_request_template.md" }).writeFile(
        props.pullRequestTemplate
      );
    }

    if (props?.buildWorkflow?.enabled) {
      new BuildWorkflow(this, "build-workflow", props.buildWorkflow);
    }
  }
}
