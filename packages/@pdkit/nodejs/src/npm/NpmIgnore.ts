import { File, XConstruct } from "@pdkit/core/src";

export class NpmIgnore extends File {
  constructor(scope: XConstruct, id: string, paths: string[]) {
    super(scope, id, ".npmignore");

    this.appendFile(paths.join("\n"));
  }

  add(path: string) {
    this.appendFile(path);
  }
}
