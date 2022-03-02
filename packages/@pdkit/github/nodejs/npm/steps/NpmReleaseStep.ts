import { XConstruct } from "@pdkit/core";
import { GithubJobStep, GithubJobStepProps } from "../../../constructs/GithubJobStep";

export class NpmReleaseStep extends GithubJobStep {
  constructor(scope: XConstruct, id: string, props: GithubJobStepProps) {
    super(scope, id, {
      name: "Release",
      run: "npm run release",
      ...props,
    });
  }
}
