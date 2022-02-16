import { XConstruct } from "@pdkit/core/src";
import { TypescriptSupport, TypescriptSupportProps } from "../constructs/TypescriptSupport";
import { NodeProjectProps, NpmProject } from "./NpmProject";

export interface NpmTypescriptProjectProps extends NodeProjectProps {
  tsconfig?: TypescriptSupportProps;
}

/**
 * The NpmTypescriptProject is an extension of the standard NPM project, but with Typescript support.
 */
export class NpmTypescriptProject extends NpmProject {
  constructor(scope: XConstruct, id: string, props: NpmTypescriptProjectProps) {
    super(scope, id, props);

    new TypescriptSupport(this, props.tsconfig);
  }
}
