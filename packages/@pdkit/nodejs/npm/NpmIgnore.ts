import { File, XConstruct } from "@pdkit/core";

export class NpmIgnore extends File {
  constructor(scope: XConstruct, id: string, paths: string[]) {
    super(scope, id, { path: ".npmignore", append: true });

    this.appendFile(paths.join("\n"));
  }

  add(path: string) {
    this.appendFile(path);
  }
}
