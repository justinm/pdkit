import { XConstruct } from "@pdkit/core/src";
import { GithubJobStep, GithubJobStepProps } from "../../../constructs/GithubJobStep";

export class YarnInstallStep extends GithubJobStep {
  constructor(scope: XConstruct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Install Dependencies",
      run: "yarn install --immutable",
      ...props,
    });
  }
}
