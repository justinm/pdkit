import { Construct } from "constructs";
import { GithubStep, GithubJobStepProps } from "../../L1";

export interface FindSelfMutationStepProps extends GithubJobStepProps {
  readonly patchProps?: GithubJobStepProps;
}

export class FindSelfMutationStep extends GithubStep {
  constructor(scope: Construct, id: string, props?: FindSelfMutationStepProps) {
    const outputId = "self_mutation_happened";

    super(scope, "FindSelfMutationStep", {
      name: "Find mutations",
      run: ["git add .", `git diff --staged --patch --exit-code > .repo.patch || echo "::set-output name=${outputId}::true"`].join("\n"),
      ...props,
    });

    new GithubStep(scope, "UploadMutations", {
      name: "Upload Patch",
      uses: "actions/upload-artifact@v2",
      if: `steps.self_mutation.outputs.${outputId}`,
      with: {
        name: "${{ .repo.patch }}",
        path: "${{ runner.temp }}",
      },
      ...props?.patchProps,
    });
  }
}
