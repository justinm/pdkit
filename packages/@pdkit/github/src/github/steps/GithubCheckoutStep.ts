import { XConstruct } from "@pdkit/core/src";
import { GithubJobStep, GithubJobStepProps } from "../../constructs/GithubJobStep";

export class GithubCheckoutStep extends GithubJobStep {
  constructor(scope: XConstruct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Checkout",
      uses: "actions/checkout@v2",
      with: {
        ref: "${{ github.event.pull_request.head.ref }}",
        repository: "${{ github.event.pull_request.head.repo.full_name }}",
      },
      ...props,
    });
  }
}
