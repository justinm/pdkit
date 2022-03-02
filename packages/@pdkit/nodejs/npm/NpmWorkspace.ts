import { Workspace, WorkspaceProps } from "@pdkit/core";
import { NpmTaskManager } from "./NpmTaskManager";

export interface NpmWorkspaceProps extends WorkspaceProps {}

export class NpmWorkspace extends Workspace {
  constructor(id: string, props?: NpmWorkspaceProps) {
    super(id, props);

    new NpmTaskManager(this, "NpmTaskHandler");
  }
}
