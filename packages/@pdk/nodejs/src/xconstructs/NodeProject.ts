import { GitIgnore } from "../../../core/src/GitIgnore";
import { NodePackageJson, NodePackageJsonProps } from "./NodePackageJson";
import { XProject, XProjectProps } from "../../../core/src/xconstructs/XProject";
import { Workspace } from "../../../core/src/Workspace";
import { NodePackageManager } from "./NodePackageManager";
import { YarnSupport } from "./YarnSupport";

export enum PackageManagerType {
  YARN,
  NPM,
}

export interface NodeProjectProps extends XProjectProps {
  readonly packageName?: string;
  readonly packageJson?: NodePackageJsonProps;
  readonly packageManagerType?: PackageManagerType;
}

export class NodeProject extends XProject {
  readonly gitignore: GitIgnore;
  readonly packageJson: NodePackageJson;
  readonly packageManager: NodePackageManager;

  constructor(scope: Workspace | XProject, id: string, props?: NodeProjectProps) {
    super(scope, id, props);

    this.gitignore = new GitIgnore(this, "StandardIgnore", ["test?", "test", "cdk.out"]);
    this.packageJson = new NodePackageJson(this, "PackageJson", {
      ...props?.packageJson,
      name: props?.packageName ?? props?.packageJson?.name ?? id,
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
