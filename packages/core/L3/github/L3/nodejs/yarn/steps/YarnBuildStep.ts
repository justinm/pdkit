import { Construct } from "constructs";
import { GithubStep, GithubJobStepProps } from "../../../../L1";

export class YarnBuildStep extends GithubStep {
  constructor(scope: Construct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Build",
      run: "yarn build",
      ...props,
    });
  }
}
