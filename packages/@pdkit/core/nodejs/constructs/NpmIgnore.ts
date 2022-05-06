import { Construct } from "constructs";
import { AppendFile } from "../../core";

export class NpmIgnore extends AppendFile {
  constructor(scope: Construct, id: string, paths: string[]) {
    super(scope, id, { filePath: ".npmignore", content: paths.join("\n") });
  }
}
