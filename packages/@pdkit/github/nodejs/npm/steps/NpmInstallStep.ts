import { XConstruct } from "@pdkit/core";
import { GithubJobStep, GithubJobStepProps } from "../../../constructs/GithubJobStep";

export class NpmInstallStep extends GithubJobStep {
  constructor(scope: XConstruct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Install Dependencies",
      run: "npm ci",
      ...props,
    });
  }
}
