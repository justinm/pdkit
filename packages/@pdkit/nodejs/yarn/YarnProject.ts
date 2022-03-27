import { GitIgnore, XConstruct } from "@pdkit/core";
import { NodeProjectProps, NpmProject } from "../npm";

export class YarnProject extends NpmProject {
  constructor(scope: XConstruct, id: string, props?: NodeProjectProps) {
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
