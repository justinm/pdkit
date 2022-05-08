import { Construct } from "constructs";
import { GithubStep, GithubJobStepProps } from "../../../../L1";

export class NpmBuildStep extends GithubStep {
  constructor(scope: Construct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Build",
      run: "npm run build",
      ...props,
    });
  }
}
