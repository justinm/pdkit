import { XConstruct } from "@pdkit/core";
import { GithubJobStep, GithubJobStepProps } from "../../../constructs/GithubJobStep";

export class YarnBuildStep extends GithubJobStep {
  constructor(scope: XConstruct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Build",
      run: "yarn build",
      ...props,
    });
  }
}
