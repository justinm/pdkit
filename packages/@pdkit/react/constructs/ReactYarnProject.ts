import { XConstruct } from "@pdkit/core";
import { YarnProject, YarnProjectProps } from "@pdkit/nodejs";
import { ReactSupport, ReactSupportProps } from "./ReactSupport";

export interface ReactYarnProjectProps extends YarnProjectProps, ReactSupportProps {}

export class ReactYarnProject extends YarnProject {
  constructor(scope: XConstruct, id: string, props: ReactYarnProjectProps) {
    super(scope, id, props);

    new ReactSupport(this, props);
  }
}
