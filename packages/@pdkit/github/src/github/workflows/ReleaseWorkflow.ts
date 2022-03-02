import { XConstruct } from "@pdkit/core/src";
import { GithubWorkflow, GithubWorkflowProps } from "../../constructs/GithubWorkflow";
import { ReleaseJob, ReleaseJobProps } from "../jobs/ReleaseJob";

export interface ReleaseWorkflowProps extends GithubWorkflowProps {
  branches: string[];
  release: ReleaseJobProps;
}

export class ReleaseWorkflow extends GithubWorkflow {
  constructor(scope: XConstruct, id: string, props: ReleaseWorkflowProps) {
    super(scope, id, {
      events: {
        push: {
          branches: props.branches,
        },
        workflowDispatch: {},
      },
      ...props,
    });

    new ReleaseJob(this, "release", { priority: 10, ...props.release });
  }
}
