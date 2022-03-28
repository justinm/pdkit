import { ManifestEntry, Project, XConstruct } from "@pdkit/core";
import { TypescriptSupport, TypescriptSupportProps } from "../constructs";
import { JestTypescriptSupport } from "../jest";
import { NpmProjectProps, NpmProject } from "./NpmProject";

export interface NpmTypescriptProjectProps extends NpmProjectProps {
  tsconfig?: TypescriptSupportProps;
}

/**
 * The NpmTypescriptProject is an extension of the standard NPM project, but with Typescript support.
 */
export class NpmTypescriptProject extends NpmProject {
  constructor(scope: XConstruct, id: string, props: NpmTypescriptProjectProps) {
    super(scope, id, { ...props, jest: undefined });

    if (props.jest?.enabled) {
      new JestTypescriptSupport(this, props.jest);
    }

    new TypescriptSupport(this, props.tsconfig);

    if (props.scripts) {
      new ManifestEntry(Project.of(this), "EnsureScripts", { scripts: props.scripts });
    }
  }
}
