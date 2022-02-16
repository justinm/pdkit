import { TypescriptSupport, TypescriptSupportProps } from "../constructs/TypescriptSupport";
import { YarnWorkspace, YarnWorkspaceProps } from "@pdkit/nodejs/src";
import { Project } from "@pdkit/core/src";

export interface YarnTypescriptWorkspaceProps extends YarnWorkspaceProps {
  /**
   * Optionally specify custom tsconfig.json configuration if needed
   */
  tsconfig?: TypescriptSupportProps;
}

/**
 * The YarnTypescriptWorkspace is an extension of the standard Yarn workspace, but with Typescript support.
 */
export class YarnTypescriptWorkspace extends YarnWorkspace {
  constructor(id: string, props: YarnTypescriptWorkspaceProps) {
    super(id, props);

    new TypescriptSupport(Project.of(this), props.tsconfig);
  }
}
