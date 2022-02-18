import { XConstruct } from "../base/XConstruct";
import { File } from "../constructs/File";

export class GitIgnore extends File {
  constructor(scope: XConstruct, id: string, paths: string[]) {
    super(scope, id, { path: ".gitignore", append: true });

    this.writeFile(paths.join("\n"));
  }

  add(path: string) {
    this.appendFile(path);
  }
}
