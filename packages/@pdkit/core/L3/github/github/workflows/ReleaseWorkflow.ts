import { Construct } from "constructs";
import { GithubWorkflow, GithubWorkflowProps } from "../../constructs/GithubWorkflow";
import { ReleaseJob, ReleaseJobProps } from "../jobs/ReleaseJob";

export interface ReleaseWorkflowProps extends GithubWorkflowProps, ReleaseJobProps {
  branches: string[];
}

export class ReleaseWorkflow extends GithubWorkflow {
  constructor(scope: Construct, id: string, props: ReleaseWorkflowProps) {
    super(scope, id, {
      events: {
        push: {
          branches: props.branches,
        },
        workflowDispatch: {},
      },
      ...props,
    });

    new ReleaseJob(this, "release", { priority: 10, ...props });
  }
}