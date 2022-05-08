import { NodeWorkspace, NodeWorkspaceProps } from "./NodeWorkspace";

export interface YarnWorkspaceProps extends NodeWorkspaceProps {}

export class YarnWorkspace extends NodeWorkspace {
  constructor(props?: YarnWorkspaceProps) {
    super(props);
  }
}
