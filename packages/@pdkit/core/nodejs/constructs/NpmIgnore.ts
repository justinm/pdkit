import { AppendableFile, XConstruct } from "../../core";

export class NpmIgnore extends AppendableFile {
  constructor(scope: XConstruct, paths: string[]) {
    super(scope, ".npmignore", { content: paths.join("\n") });
  }

  add(path: string) {
    this.append(path);
  }
}
