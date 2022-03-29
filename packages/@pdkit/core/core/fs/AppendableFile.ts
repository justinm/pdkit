import hash from "object-hash";
import { XConstruct } from "../base/XConstruct";
import { File, FileProps } from "./File";

export interface AppendableFileProps extends FileProps {
  readonly content: string;
}

export class AppendableFile extends File {
  constructor(scope: XConstruct, filePath: string, props: AppendableFileProps) {
    super(scope, filePath, { id: `${filePath}-${hash(props)}` });

    this.write(props.content + "\n");
  }
}
