import { XConstruct } from "@pdkit/core/src";
import { GithubJobStep, GithubJobStepProps } from "../../../constructs/GithubJobStep";

export class NpmBuildStep extends GithubJobStep {
  constructor(scope: XConstruct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Build",
      run: "npm run build",
      ...props,
    });
  }
}
