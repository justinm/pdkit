import { GitIgnore } from "./GitIgnore";
import { XFileSystemSynthesizer } from "../../core/src/synthesizers/XFileSystemSynthesizer";
import { NodePackageJson, NodePackageJsonProps } from "./NodePackageJson";
import { XProject, XProjectProps } from "../../core/src/constructs/XProject";
import { Author } from "./Author";
import { Workspace } from "../../core/src/Workspace";
import { NodePackageManager } from "./constructs/NodePackageManager";
import { YarnSupport } from "./YarnSupport";

export enum PackageManagerType {
  YARN,
  NPM,
}

export interface NodeProjectProps extends XProjectProps {
  readonly packageJson?: NodePackageJsonProps;
  readonly packageManagerType?: PackageManagerType;
}

export class NodeProject extends XProject {
  readonly gitignore: GitIgnore;
  readonly packageJson: NodePackageJson;
  readonly packageManager: NodePackageManager;

  constructor(scope: Workspace, id: string, props?: NodeProjectProps) {
    super(scope, id, props);

    new XFileSystemSynthesizer(this, "FileSystemSynthesizer");
    this.gitignore = new GitIgnore(this, "StandardIgnore", ["test?", "test", "cdk.out"]);
    this.packageJson = new NodePackageJson(this, "PackageJson", {
      ...props?.packageJson,
      name: id,
    });

    switch (props?.packageManagerType) {
      case PackageManagerType.YARN:
      default:
        this.packageManager = new YarnSupport(this, "Yarn");
    }

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];
        const hasPackageManager = !!this.node.children.find((c) => c instanceof NodePackageManager);

        if (!hasPackageManager) {
          errors.push("The root project must contain a package manager");
        }

        return errors;
      },
    });
  }
}

const workspace = new Workspace("projenx");
const project = new NodeProject(workspace, "@projenx/core");

new Author(project, "Author", {
  name: "Justin McCormick",
  email: "me@justinmccormick.com",
});

workspace.synthesize();
