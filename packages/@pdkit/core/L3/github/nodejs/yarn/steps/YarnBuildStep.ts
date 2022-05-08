import { Construct } from "constructs";
import { GithubJobStep, GithubJobStepProps } from "../../../constructs/GithubJobStep";

export class YarnBuildStep extends GithubJobStep {
  constructor(scope: Construct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Build",
      run: "yarn build",
      ...props,
    });
  }
}
