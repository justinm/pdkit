import { XConstruct } from "@pdkit/core";
import { GithubJobStep, GithubJobStepProps } from "../../constructs/GithubJobStep";

export interface CacheStepProps extends GithubJobStepProps {
  readonly key: string;
  readonly path: string;
}

export class CacheStep extends GithubJobStep {
  constructor(scope: XConstruct, id: string, props: CacheStepProps) {
    super(scope, id, {
      name: "Cache",
      uses: "actions/cache@v2",
      with: {
        key: props.key,
        path: props.path,
      },
      ...props,
    });
  }
}
