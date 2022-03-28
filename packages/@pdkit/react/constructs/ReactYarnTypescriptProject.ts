import { XConstruct } from "@pdkit/core";
import { YarnTypescriptProject, YarnTypescriptProjectProps } from "@pdkit/nodejs";
import { ReactSupport, ReactSupportProps } from "./ReactSupport";

export interface ReactYarnTypescriptProjectProps extends YarnTypescriptProjectProps, ReactSupportProps {}

export class ReactYarnTypescriptProject extends YarnTypescriptProject {
  constructor(scope: XConstruct, id: string, props: ReactYarnTypescriptProjectProps) {
    super(scope, id, props);

    new ReactSupport(this, props);
  }
}
