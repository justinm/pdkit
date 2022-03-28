import { GitIgnore, XConstruct } from "@pdkit/core";
import { NpmProjectProps, NpmProject } from "../npm";

export interface YarnProjectProps extends NpmProjectProps {}

export class YarnProject extends NpmProject {
  constructor(scope: XConstruct, id: string, props?: YarnProjectProps) {
    super(scope, id, {
      installCommands: ["yarn"],
      ...props,
    });

    new GitIgnore(this, [
      ".yarn/*",
      "!.yarn/releases",
      "!.yarn/patches",
      "!.yarn/plugins",
      "!.yarn/sdks",
      "!.yarn/versions",
      ".pnp.*",
      ".yarn-integrity",
    ]);
  }
}
