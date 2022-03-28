import { XConstruct } from "@pdkit/core";
import { NpmProject, NpmProjectProps } from "@pdkit/nodejs";
import { ReactSupport, ReactSupportProps } from "./ReactSupport";

export interface ReactNpmProjectProps extends NpmProjectProps, ReactSupportProps {}

export class ReactNpmProject extends NpmProject {
  constructor(scope: XConstruct, id: string, props: ReactNpmProjectProps) {
    super(scope, id, props);

    new ReactSupport(this, props);
  }
}
