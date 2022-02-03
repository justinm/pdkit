import { Construct } from "constructs";
import { XSynthesizer } from "./XSynthesizer";
import { IXFile, XFile } from "../xconstructs/XFile";
import { IXConstruct } from "../xconstructs/XConstruct";
import { XProject } from "../xconstructs/XProject";
import { Workspace } from "../Workspace";

export interface IXFileSystemSynthesizer {
  /**
   * The root of the project relative to the root project's path. The path will be derived automatically if not provided.
   */
}

export class XFileSystemSynthesizer extends XSynthesizer implements IXFileSystemSynthesizer {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.node.addValidation({
      validate: () => {
        const project = XProject.of(this);
        const synthesizers = project.synthesizers;

        if (synthesizers.find((s) => s !== this)) {
          return ["Only one XFileSystemSynthesizer is allowed per workspace"];
        }

        return [];
      },
    });
  }

  get vfs() {
    return Workspace.of(this).vfs;
  }

  _willHandleConstruct(construct: IXConstruct): boolean {
    return construct instanceof XFile;
  }

  _synthesize(construct: IXFile) {
    const project = XProject.of(construct);

    this.vfs.writeFile(project, construct);
  }

  _finalize() {}
}
