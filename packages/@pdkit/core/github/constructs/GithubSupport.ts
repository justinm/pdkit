import { File, XConstruct, Project } from "../../core";
import { BuildWorkflow, BuildWorkflowProps } from "../github/workflows/BuildWorkflow";
import {
  SemanticPullRequestLintWorkflowProps,
  PullRequestLintWorkflow,
} from "../github/workflows/PullRequestLintWorkflow";
import { ReleaseWorkflow, ReleaseWorkflowProps } from "../github/workflows/ReleaseWorkflow";

export interface GithubSupportProps {
  readonly pullRequestLint?: Omit<SemanticPullRequestLintWorkflowProps, "runsOn">;
  readonly pullRequestTemplate?: string;
  readonly workflows?: {
    readonly build?: {
      readonly enabled: boolean;
    } & BuildWorkflowProps;
    readonly release?: {
      readonly branches: string[];
      readonly enabled: boolean;
    } & ReleaseWorkflowProps;
  };
}

export class GithubSupport extends XConstruct {
  constructor(scope: Project, id: string, props?: GithubSupportProps) {
    super(scope, id);

    if (props?.pullRequestLint) {
      new PullRequestLintWorkflow(this, "pull-request-lint", props?.pullRequestLint);
    }

    if (props?.pullRequestTemplate) {
      new File(this, ".github/pull_request_template.md").write(props.pullRequestTemplate);
    }

    if (props?.workflows?.build?.enabled) {
      new BuildWorkflow(this, "build-workflow", props.workflows.build);
    }

    if (props?.workflows?.release?.enabled) {
      new ReleaseWorkflow(this, "release-workflow", props.workflows.release);
    }
  }
}
