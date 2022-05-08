import { Construct } from "constructs";
import { GithubStep, GithubJobStepProps } from "../../../../L1";

export class YarnInstallStep extends GithubStep {
  constructor(scope: Construct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Install Dependencies",
      run: "yarn install --immutable",
      ...props,
    });
  }
}
