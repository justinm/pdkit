import { TypescriptSupport, TypescriptSupportProps } from "../constructs/TypescriptSupport";
import { YarnWorkspace, YarnWorkspaceProps } from "@pdkit/nodejs/src";
import { Project } from "@pdkit/core/src";

export interface YarnTypescriptWorkspaceProps extends YarnWorkspaceProps {
  tsconfig?: TypescriptSupportProps;
}

export class YarnTypescriptWorkspace extends YarnWorkspace {
  constructor(id: string, props: YarnTypescriptWorkspaceProps) {
    super(id);

    new TypescriptSupport(Project.of(this), props.tsconfig);
  }
}
