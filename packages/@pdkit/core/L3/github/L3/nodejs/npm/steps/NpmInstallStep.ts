import { Construct } from "constructs";
import { GithubStep, GithubJobStepProps } from "../../../../L1";

export class NpmInstallStep extends GithubStep {
  constructor(scope: Construct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Install Dependencies",
      run: "npm ci",
      ...props,
    });
  }
}
