import { Construct } from "constructs";
import { GithubStep, GithubJobStepProps } from "../../L1";

export class GithubCheckoutStep extends GithubStep {
  constructor(scope: Construct, id: string, props?: GithubJobStepProps) {
    super(scope, id, {
      name: "Checkout",
      uses: "actions/checkout@v2",
      ...props,
    });
  }
}
