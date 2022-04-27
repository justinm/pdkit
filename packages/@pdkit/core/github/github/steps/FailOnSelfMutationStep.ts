import { XConstruct } from "../../../core";
import { GithubJobStep, GithubJobStepProps } from "../../constructs/GithubJobStep";

export interface SelfMutationStepProps extends GithubJobStepProps {
  readonly patchProps?: GithubJobStepProps;
  readonly outputId?: string;
}

export class FailOnSelfMutationStep extends XConstruct {
  constructor(scope: XConstruct, id: string, props?: SelfMutationStepProps) {
    super(scope, id);

    new GithubJobStep(scope, "FailOnSelfMutationStep", {
      name: "Fail build on mutation",
      if: `steps.self_mutation.outputs.${props?.outputId ?? "self_mutation_happened"}`,
      run: [
        'echo "::error::Files were changed during build (see build log). If this was triggered from a fork, you will need to update your branch."',
        "cat .repo.patch",
        "exit 1",
      ].join("\n"),
      ...props?.patchProps,
    });
  }
}
