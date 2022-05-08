import { Construct } from "constructs";
import { GithubJobStep, GithubJobStepProps } from "../../../constructs/GithubJobStep";

export class NpmReleaseStep extends GithubJobStep {
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
