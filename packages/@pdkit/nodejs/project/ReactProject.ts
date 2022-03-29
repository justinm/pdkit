import { XConstruct } from "@pdkit/core";
import { ReactSupport, ReactSupportProps } from "../tools/ReactSupport";
import { NodeProject, NodeProjectProps } from "./NodeProject";

export interface ReactProjectProps extends NodeProjectProps, ReactSupportProps {}

export class ReactProject extends NodeProject {
  constructor(scope: XConstruct, id: string, props: ReactProjectProps) {
    super(scope, id, props);

    new ReactSupport(this, props);
  }
}
