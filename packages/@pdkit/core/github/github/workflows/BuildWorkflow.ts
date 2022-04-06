import { XConstruct } from "../../../core";
import { GithubWorkflow, GithubWorkflowProps } from "../../constructs/GithubWorkflow";
import { BuildJob, BuildJobProps } from "../jobs/BuildJob";
import { JestCoverageJob, JestCoverageJobProps } from "../jobs/JestCoverageJob";

export interface BuildWorkflowProps extends GithubWorkflowProps, BuildJobProps {
  coverage?: { enabled: boolean } & JestCoverageJobProps;
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

    new BuildJob(this, "build", props);

    if (props.coverage?.enabled) {
      new JestCoverageJob(this, "coverage", props.coverage);
    }
  }
}
