import { Workspace, File, XConstruct } from "@pdkit/core";
import { BuildJobProps } from "../github/jobs/BuildJob";
import { ReleaseJobProps } from "../github/jobs/ReleaseJob";
import { BuildWorkflow } from "../github/workflows/BuildWorkflow";
import {
  SemanticPullRequestLintWorkflowProps,
  PullRequestLintWorkflow,
} from "../github/workflows/PullRequestLintWorkflow";
import { ReleaseWorkflow } from "../github/workflows/ReleaseWorkflow";

export interface GithubSupportProps {
  readonly pullRequestLint?: Omit<SemanticPullRequestLintWorkflowProps, "runsOn">;
  readonly pullRequestTemplate?: string;
  readonly workflows?: {
    readonly build?: {
      readonly enabled: boolean;
    } & BuildJobProps;
    readonly release?: {
      readonly branches: string[];
      readonly enabled: boolean;
    } & ReleaseJobProps;
  };
}

export class GithubSupport extends XConstruct {
  constructor(scope: Workspace, id: string, props?: GithubSupportProps) {
    super(scope, id);

    if (props?.pullRequestLint) {
      new PullRequestLintWorkflow(this, "pull-request-lint", props?.pullRequestLint);
    }

    if (props?.pullRequestTemplate) {
      new File(this, ".github/pull_request_template.md").write(props.pullRequestTemplate);
    }

    if (props?.workflows?.build?.enabled) {
      new BuildWorkflow(this, "build-workflow", { build: props.workflows.build });
    }

    if (props?.workflows?.release?.enabled) {
      new ReleaseWorkflow(this, "release-workflow", {
        branches: props?.workflows.release.branches,
        release: props.workflows.release,
      });
    }
  }
}
