import { NodeWorkspace, NodeWorkspaceProps } from "./index";

export interface YarnWorkspaceProps extends NodeWorkspaceProps {}

export class YarnWorkspace extends NodeWorkspace {
  constructor(id: string, props: YarnWorkspaceProps) {
    super(id, props);
  }
}
