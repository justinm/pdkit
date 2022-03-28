import { XConstruct } from "@pdkit/core";
import { NpmTypescriptProject, NpmTypescriptProjectProps } from "@pdkit/nodejs";
import { ReactSupport, ReactSupportProps } from "./ReactSupport";

export interface ReactNpmTypescriptProjectProps extends NpmTypescriptProjectProps, ReactSupportProps {}

export class ReactNpmTypescriptProject extends NpmTypescriptProject {
  constructor(scope: XConstruct, id: string, props: ReactNpmTypescriptProjectProps) {
    super(scope, id, props);

    new ReactSupport(this, props);
  }
}
