import { Workspace, WorkspaceProps } from "@pdkit/core";

export interface NpmWorkspaceProps extends WorkspaceProps {}

export class NpmWorkspace extends Workspace {
  constructor(id: string, props?: NpmWorkspaceProps) {
    super(id, props);
  }
}