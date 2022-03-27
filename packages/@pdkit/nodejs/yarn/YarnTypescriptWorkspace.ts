import { ManifestEntry, PDKIT_CONFIG_FILE, Project } from "@pdkit/core";
import { TypescriptSupport, TypescriptSupportProps } from "../constructs";
import { YarnWorkspace, YarnWorkspaceProps } from "./YarnWorkspace";

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

    new TypescriptSupport(Project.of(this), {
      ...props.tsconfig,
      include: [...(props.tsconfig?.include ?? []), PDKIT_CONFIG_FILE],
      compilerOptions: {
        ...props.tsconfig?.compilerOptions,
        noEmit: props.tsconfig?.compilerOptions?.noEmit ?? true,
        declaration: props.tsconfig?.compilerOptions?.declaration ?? false,
      },
    });

    if (props.scripts) {
      new ManifestEntry(Project.of(this), "EnsureScripts", { scripts: props.scripts });
    }
  }
}
