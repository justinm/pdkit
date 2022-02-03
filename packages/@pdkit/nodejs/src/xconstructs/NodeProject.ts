import { NodePackageJson, NodePackageJsonProps } from "./NodePackageJson";
import { XProject, XProjectProps } from "../../../core/src/xconstructs/XProject";
import { Workspace } from "../../../core/src/Workspace";
import { NodePackageManager } from "./NodePackageManager";
import { YarnSupport } from "./YarnSupport";

export enum PackageManagerType {
  YARN,
  NPM,
}

export interface NodeProjectProps
  extends XProjectProps,
    Pick<NodePackageJsonProps, "dependencies" | "devDependencies" | "peerDependencies"> {
  readonly packageName?: string;
  readonly packageJson?: NodePackageJsonProps;
  readonly packageManagerType?: PackageManagerType;
}

export class NodeProject extends XProject {
  readonly packageJson: NodePackageJson;
  readonly packageManager: NodePackageManager;

  constructor(scope: Workspace | XProject, id: string, props?: NodeProjectProps) {
    super(scope, id, props);

    this.packageJson = new NodePackageJson(this, "PackageJson", {
      dependencies: props?.dependencies ?? props?.packageJson?.dependencies,
      devDependencies: props?.devDependencies ?? props?.packageJson?.devDependencies,
      peerDependencies: props?.peerDependencies ?? props?.packageJson?.peerDependencies,
      name: props?.packageName ?? props?.packageJson?.name ?? id,
      ...props?.packageJson,
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
