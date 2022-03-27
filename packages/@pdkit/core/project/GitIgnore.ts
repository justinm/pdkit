import { XConstruct } from "../base/XConstruct";
import { AppendableFile } from "../fs";

export class GitIgnore extends AppendableFile {
  constructor(scope: XConstruct, paths: string[]) {
    super(scope, ".gitignore", { content: paths.join("\n") });
  }
}
