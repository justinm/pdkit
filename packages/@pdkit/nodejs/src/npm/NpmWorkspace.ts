import { Workspace, WorkspaceProps } from "@pdkit/core/src";
import { GithubSupport, GithubSupportProps } from "@pdkit/core/src/github/GithubSupport";

export interface NpmWorkspaceProps extends WorkspaceProps {
  readonly github?: boolean;
  readonly githubConfig?: GithubSupportProps;
}

export class NpmWorkspace extends Workspace {
  constructor(id: string, props?: NpmWorkspaceProps) {
    super(id, props);

    if (props?.github) {
      new GithubSupport(this, "GithubSupport", { pullRequestLint: true, ...props.githubConfig });
    }
  }
}
