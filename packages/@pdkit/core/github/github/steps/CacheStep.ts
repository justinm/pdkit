import { XConstruct } from "../../../core";
import { GithubJobStep, GithubJobStepProps } from "../../constructs/GithubJobStep";

export interface CacheStepProps extends GithubJobStepProps {
  readonly key: string;
  readonly path: string;
}

export class CacheStep extends GithubJobStep {
  constructor(scope: XConstruct, id: string, props: CacheStepProps) {
    const { key, path, ...other } = props;
    super(scope, id, {
      name: "Cache",
      uses: "actions/cache@v2",
      with: {
        key,
        path,
      },
      ...other,
    });
  }
}
