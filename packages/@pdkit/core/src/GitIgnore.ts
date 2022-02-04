import { XFile } from "./xconstructs/XFile";
import { XProject } from "./xconstructs/XProject";

export class GitIgnore extends XFile {
  constructor(scope: XProject, id: string, paths: string[]) {
    super(scope, id, ".gitignore");

    this.writeFile(paths.join("\n"));
  }

  add(path: string) {
    this.appendFile(path);
  }
}
