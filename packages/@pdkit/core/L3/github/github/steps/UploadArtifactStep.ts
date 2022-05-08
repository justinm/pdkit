import { Construct } from "constructs";
import { GithubJobStep, GithubJobStepProps } from "../../constructs/GithubJobStep";

export interface UploadArtifactStepProps extends GithubJobStepProps {
  readonly artifactName: string;
  readonly artifactPath: string;
}

export class UploadArtifactStep extends GithubJobStep {
  constructor(scope: Construct, id: string, props: UploadArtifactStepProps) {
    super(scope, id, {
      name: "Upload Patch",
      uses: "actions/upload-artifact@v2",
      with: {
        name: props.artifactName,
        path: props.artifactPath,
      },
      ...props,
    });
  }
}
