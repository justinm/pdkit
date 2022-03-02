import { XConstruct } from "@pdkit/core";
import { GithubWorkflow, GithubWorkflowProps } from "../../constructs/GithubWorkflow";
import { BuildJob, BuildJobProps } from "../jobs/BuildJob";

export interface BuildWorkflowProps extends GithubWorkflowProps {
  build: BuildJobProps;
}

export class BuildWorkflow extends GithubWorkflow {
  constructor(scope: XConstruct, id: string, props: BuildWorkflowProps) {
    super(scope, id, {
      events: {
        pullRequest: {},
        workflowDispatch: {},
      },
      ...props,
    });

    new BuildJob(this, "build", props.build);
  }
}
