import { NodeProjectProps, NpmProject } from "@pdkit/nodejs/src";
import { XConstruct } from "@pdkit/core/src";
import { TypescriptSupport, TypescriptSupportProps } from "../constructs/TypescriptSupport";

export interface NpmTypescriptProjectProps extends NodeProjectProps {
  tsconfig?: TypescriptSupportProps;
}

export class NpmTypescriptProject extends NpmProject {
  constructor(scope: XConstruct, id: string, props: NpmTypescriptProjectProps) {
    super(scope, id, props);

    new TypescriptSupport(this, props.tsconfig);
  }
}
