import { Workspace } from "@pdkit/core/src";
import { XConstruct } from "@pdkit/core/src/base/XConstruct";
import { File } from "@pdkit/core/src/constructs/File";
import { BuildJobProps } from "../github/jobs/BuildJob";
import { BuildWorkflow } from "../github/workflows/BuildWorkflow";
import {
  SemanticPullRequestLintWorkflowProps,
  PullRequestLintWorkflow,
} from "../github/workflows/PullRequestLintWorkflow";

export interface GithubSupportProps {
  readonly pullRequestLint?: Omit<SemanticPullRequestLintWorkflowProps, "runsOn">;
  readonly pullRequestTemplate?: string;
  readonly workflows?: {
    readonly build?: {
      readonly enabled: boolean;
    } & BuildJobProps;
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

    if (props?.workflows?.build?.enabled) {
      new BuildWorkflow(this, "build-workflow", { build: props.workflows.build });
    }
  }
}
