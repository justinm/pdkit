import { Construct } from "constructs";
import { FileProps } from "../../L1";
import { AppendFile } from "./AppendFile";

export interface GitIgnoreProps extends Pick<FileProps, "filePath"> {}

export class GitIgnore extends AppendFile {
  constructor(scope: Construct, id: string, paths: string[], props?: GitIgnoreProps) {
    super(scope, id, { filePath: props?.filePath ?? ".gitignore", content: paths.join("\n") });
  }
}
