import { Construct } from "constructs";
import { GithubJobStep, GithubJobStepProps } from "../../../constructs/GithubJobStep";

export class NpmInstallStep extends GithubJobStep {
  constructor(scope: Construct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Install Dependencies",
      run: "npm ci",
      ...props,
    });
  }
}
