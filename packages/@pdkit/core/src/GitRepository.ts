import { XRepository } from "./xconstructs/XRepository";
import { Construct } from "constructs";

export interface GitRepositoryProps {
  readonly repositoryUrl: string;
  readonly mainBranch?: string;
}

export class GitRepository extends XRepository {
  public static readonly TYPE = "GitRepository";
  readonly type: string = GitRepository.TYPE;
  readonly repositoryUrl?: string;
  readonly mainBranch?: string;

  constructor(scope: Construct, id: string, props: GitRepositoryProps) {
    super(scope, id);

    this.repositoryUrl = props?.repositoryUrl;
    this.mainBranch = props?.mainBranch;
  }
}
