import { XConstruct } from "@pdkit/core/src";
import { TypescriptSupport, TypescriptSupportProps } from "../constructs/TypescriptSupport";
import { NodeProjectProps } from "../npm/NpmProject";
import { YarnProject } from "./YarnProject";

export interface YarnTypescriptProjectProps extends NodeProjectProps {
  tsconfig?: TypescriptSupportProps;
}

/**
 * The YarnTypescriptProject is an extension of the standard Yarn project, but with Typescript support.
 */
export class YarnTypescriptProject extends YarnProject {
  constructor(scope: XConstruct, id: string, props: YarnTypescriptProjectProps) {
    super(scope, id, props);

    new TypescriptSupport(this, props.tsconfig);
  }
}
