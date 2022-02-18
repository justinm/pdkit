import { XConstruct } from "@pdkit/core/src";
import { TypescriptSupportProps } from "../constructs/TypescriptSupport";
import { NodeProjectProps } from "../npm/NpmProject";
import { NpmTypescriptProject } from "../npm/NpmTypescriptProject";

export interface YarnTypescriptProjectProps extends NodeProjectProps {
  tsconfig?: TypescriptSupportProps;
}

/**
 * The YarnTypescriptProject is an extension of the standard Yarn project, but with Typescript support.
 */
export class YarnTypescriptProject extends NpmTypescriptProject {
  constructor(scope: XConstruct, id: string, props: YarnTypescriptProjectProps) {
    super(scope, id, {
      installCommand: "yarn",
      ...props,
    });
  }
}
