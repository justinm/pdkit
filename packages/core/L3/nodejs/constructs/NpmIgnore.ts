import { Construct } from "constructs";
import { AppendFile } from "../../../L2";

export class NpmIgnore extends AppendFile {
  constructor(scope: Construct, id: string, paths: string[]) {
    super(scope, id, { filePath: ".npmignore", content: paths.join("\n") });
  }
}
