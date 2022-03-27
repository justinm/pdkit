import { XConstruct } from "@pdkit/core";
import { GithubJobStep, GithubJobStepProps } from "../../constructs/GithubJobStep";

export class GithubCheckoutStep extends GithubJobStep {
  constructor(scope: XConstruct, id: string, props?: GithubJobStepProps) {
    super(scope, id, {
      name: "Checkout",
      uses: "actions/checkout@v2",
      ...props,
    });
  }
}
