import { NodeProjectProps, YarnProject } from "@pdkit/nodejs/src";
import { XConstruct } from "@pdkit/core/src";
import { TypescriptSupport, TypescriptSupportProps } from "../constructs/TypescriptSupport";

export interface YarnTypescriptProjectProps extends NodeProjectProps {
  tsconfig?: TypescriptSupportProps;
}

export class YarnTypescriptProject extends YarnProject {
  constructor(scope: XConstruct, id: string, props: YarnTypescriptProjectProps) {
    super(scope, id, props);

    new TypescriptSupport(this, props.tsconfig);
  }
}
