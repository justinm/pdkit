import { XConstruct } from "@pdkit/core";
import { TypeScriptJsxMode, YarnTypescriptProject, YarnTypescriptProjectProps } from "@pdkit/nodejs";
import { ReactSupport, ReactSupportProps } from "./ReactSupport";

export interface ReactYarnTypescriptProjectProps extends YarnTypescriptProjectProps, ReactSupportProps {}

export class ReactYarnTypescriptProject extends YarnTypescriptProject {
  constructor(scope: XConstruct, id: string, props: ReactYarnTypescriptProjectProps) {
    super(scope, id, {
      sourcePath: "src",
      ...props,
      tsconfig: { compilerOptions: { jsx: TypeScriptJsxMode.REACT_JSX } },
    });

    new ReactSupport(this, props);
  }
}
