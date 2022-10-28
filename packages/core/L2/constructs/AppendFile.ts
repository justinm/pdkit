import { Construct } from "constructs";
import { File, FileProps, IFile, Project, Bindings, LifeCycle, LifeCycleStage } from "../../L1";

export interface AppendFileProps extends FileProps {
  readonly content: string;
}

export class AppendFile extends Construct implements IFile {
  readonly content: string;
  readonly filePath: string;

  constructor(scope: Construct, id: string, props: AppendFileProps) {
    super(scope, id);

    this.content = props.content;
    this.filePath = props.filePath;

    let parentFile =
      Bindings.of(Project.of(this))
        .filterByClass(File)
        .find((file) => file.filePath === this.filePath) ?? new File(this, "ParentFile", { filePath: props.filePath });

    LifeCycle.implement(this);
    LifeCycle.of(this).on(LifeCycleStage.BEFORE_WRITE, () => {
      if (parentFile.content && parentFile.content !== "") {
        parentFile.write([parentFile.content.trimEnd(), this.content.trimEnd()].join("\n") + "\n");
      } else {
        parentFile.write(this.content.trimEnd() + "\n");
      }
    });
  }
}
