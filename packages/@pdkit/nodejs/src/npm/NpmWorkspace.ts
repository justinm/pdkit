import { Workspace, WorkspaceProps } from "@pdkit/core/src";

export interface NpmWorkspaceProps extends WorkspaceProps {}

export class NpmWorkspace extends Workspace {
  constructor(id: string, props?: NpmWorkspaceProps) {
    super(id, props);
  }
}
