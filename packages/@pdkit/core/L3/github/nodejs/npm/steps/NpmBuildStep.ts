import { Construct } from "constructs";
import { GithubJobStep, GithubJobStepProps } from "../../../constructs/GithubJobStep";

export class NpmBuildStep extends GithubJobStep {
  constructor(scope: Construct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Build",
      run: "npm run build",
      ...props,
    });
  }
}
