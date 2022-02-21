import { XConstruct } from "@pdkit/core/src/base/XConstruct";
import { GithubJob, JobPermission } from "../../constructs/GithubJob";
import { GithubWorkflow, GithubWorkflowProps } from "../../constructs/GithubWorkflow";

export interface BuildWorkflowProps extends GithubWorkflowProps {}

export class NpmBuildWorkflow extends GithubWorkflow {
  constructor(scope: XConstruct, id: string, props?: BuildWorkflowProps) {
    super(scope, id, {
      events: {
        pullRequest: {},
        workflowDispatch: {},
      },
    });

    new GithubJob(this, "build", {
      name: "Build",
      permissions: { contents: JobPermission.WRITE },
      runsOn: ["ubuntu-latest"],
      steps: [],
      outputs: {
        self_mutation_happened: {
          stepId: "self_mutation",
          outputName: "self_mutation_happened",
        },
      },
    });
  }
}
