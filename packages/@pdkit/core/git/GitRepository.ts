import { XConstruct } from "../base/XConstruct";

export interface GitRepositoryProps {
  readonly repositoryUrl: string;
  readonly mainBranch?: string;
}

export class GitRepository extends XConstruct {
  readonly repositoryUrl?: string;
  readonly mainBranch?: string;

  constructor(scope: XConstruct, id: string, props: GitRepositoryProps) {
    super(scope, id);

    this.repositoryUrl = props?.repositoryUrl;
    this.mainBranch = props?.mainBranch;
  }
}
