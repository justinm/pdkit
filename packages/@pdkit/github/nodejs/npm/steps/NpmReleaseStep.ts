import { XConstruct } from "@pdkit/core";
import { GithubJobStep, GithubJobStepProps } from "../../../constructs/GithubJobStep";

export class NpmReleaseStep extends GithubJobStep {
  constructor(scope: XConstruct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Release",
      run: "npm run release",
      ...props,
      env: {
        NPM_TOKEN: "${{ secrets.NPM_TOKEN }}",
        npm_config_access: "public",
        ...props.env,
      },
    });
  }
}
