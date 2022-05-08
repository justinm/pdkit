import { Construct } from "constructs";
import { GithubStep, GithubJobStepProps } from "../../../../L1";

export class NpmReleaseStep extends GithubStep {
  constructor(scope: Construct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Release",
      run: "npm run release",
      ...props,
      env: {
        NODE_AUTH_TOKEN: "${{ secrets.NPM_TOKEN }}",
        ...props.env,
      },
    });
  }
}
