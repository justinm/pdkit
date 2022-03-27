import { XConstruct } from "@pdkit/core";
import { TypescriptSupportProps } from "../constructs";
import { NpmTypescriptProject, NodeProjectProps } from "../npm";

export interface YarnTypescriptProjectProps extends NodeProjectProps {
  tsconfig?: TypescriptSupportProps;
}

/**
 * The YarnTypescriptProject is an extension of the standard Yarn project, but with Typescript support.
 */
export class YarnTypescriptProject extends NpmTypescriptProject {
  constructor(scope: XConstruct, id: string, props: YarnTypescriptProjectProps) {
    super(scope, id, {
      installCommands: ["yarn"],
      ...props,
    });
  }
}
