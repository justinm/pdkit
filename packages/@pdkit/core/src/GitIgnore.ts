import { Construct } from "constructs";
import { XFile } from "./xconstructs/XFile";

export class GitIgnore extends XFile {
  constructor(scope: Construct, id: string, paths: string[]) {
    super(scope, id, ".gitignore");

    this.writeFile(paths.join("\n"));
  }

  add(path: string) {
    this.appendFile(path);
  }
}
