import { XConstruct } from "@pdkit/core";
import { NpmTypescriptProject, NpmTypescriptProjectProps, TypeScriptJsxMode } from "@pdkit/nodejs";
import { ReactSupport, ReactSupportProps } from "./ReactSupport";

export interface ReactNpmTypescriptProjectProps extends NpmTypescriptProjectProps, ReactSupportProps {}

export class ReactNpmTypescriptProject extends NpmTypescriptProject {
  constructor(scope: XConstruct, id: string, props: ReactNpmTypescriptProjectProps) {
    super(scope, id, {
      sourcePath: "src",
      ...props,
      tsconfig: { compilerOptions: { jsx: TypeScriptJsxMode.REACT_JSX } },
    });

    new ReactSupport(this, props);
  }
}
