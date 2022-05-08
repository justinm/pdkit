import { Workspace, WorkspaceProps } from "../../../L1";

export interface NodeWorkspaceProps extends WorkspaceProps {}

export class NodeWorkspace extends Workspace {
  constructor(props?: NodeWorkspaceProps) {
    super(props);
  }
}
