import { Construct } from "constructs";
import { GithubWorkflow, GithubWorkflowProps } from "../../L1";
import { BuildJob, BuildJobProps, JestCoverageJob, JestCoverageJobProps } from "../jobs";

export interface BuildWorkflowProps extends GithubWorkflowProps, BuildJobProps {
  coverage?: { enabled: boolean } & JestCoverageJobProps;
}

export class BuildWorkflow extends GithubWorkflow {
  constructor(scope: Construct, id: string, props: BuildWorkflowProps) {
    super(scope, id, {
      events: {
        pullRequest: {},
        workflowDispatch: {},
      },
      ...props,
    });

    new BuildJob(this, "build", props);

    if (props.coverage?.enabled) {
      new JestCoverageJob(this, "coverage", props.coverage);
    }
  }
}
