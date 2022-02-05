import { ValidLicense, Manifest } from "../../../core/src";
import { NodeProject } from "./NodeProject";

export interface NodePackageJsonProps {
  readonly name?: string;
  readonly description?: string;
  readonly private?: boolean;
  readonly license?: ValidLicense;
  readonly homepath?: string;
  readonly repository?: string;
  readonly keywords?: string[];
  readonly main?: string;
  readonly bin?: Record<string, string>;
  readonly scripts?: Record<string, string>;
  readonly bugs?: {
    readonly url?: string;
    readonly email?: string;
  };
  readonly files?: string[];
  readonly man?: string[];
}

export class NodePackageJson extends Manifest {
  constructor(scope: NodeProject, id: string, props?: NodePackageJsonProps) {
    super(scope, id, "package.json");

    if (props) {
      this.addFields({
        name: props.name,
        description: props.description,
        private: props.private,
        homepath: props.homepath,
        repository: props.repository,
        keywords: props.keywords,
        main: props.main,
        bin: props.bin,
        scripts: props.scripts,
        bugs: props.bugs,
        files: props.files,
        man: props.man,
      });
    }
  }
}