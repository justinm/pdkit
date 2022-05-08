import { Construct } from "constructs";
import { GithubJobStep, GithubJobStepProps } from "../../constructs/GithubJobStep";

export interface CacheStepProps extends GithubJobStepProps {
  readonly key: string;
  readonly path: string;
}

export class CacheStep extends GithubJobStep {
  constructor(scope: Construct, id: string, props: CacheStepProps) {
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