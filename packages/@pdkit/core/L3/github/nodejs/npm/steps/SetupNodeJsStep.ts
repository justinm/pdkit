import { Construct } from "constructs";
import { GithubJobStep, GithubJobStepProps } from "../../../constructs/GithubJobStep";

export class SetupNodeJsStep extends GithubJobStep {
  constructor(scope: Construct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Checkout",
      uses: "actions/setup-node@v2.2.0",
      with: {
        "node-version": "12.22.0",
      },
      ...props,
    });
  }
}
