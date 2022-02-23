import { Workspace, WorkspaceProps } from "@pdkit/core/src";
import { NpmTaskHandler } from "./NpmTaskHandler";

export interface NpmWorkspaceProps extends WorkspaceProps {}

export class NpmWorkspace extends Workspace {
  constructor(id: string, props?: NpmWorkspaceProps) {
    super(id, props);

    new NpmTaskHandler(this, "NpmTaskHandler");
  }
}
