import { Workspace, WorkspaceProps } from "@pdkit/core";

export interface NodeWorkspaceProps extends WorkspaceProps {}

export class NodeWorkspace extends Workspace {
  constructor(id: string, props: NodeWorkspaceProps) {
    super(id, props);
  }
}
