import { NodePackageJson, NodePackageJsonProps } from "./NodePackageJson";
import { GitIgnore, Project, ProjectProps, Workspace, XProject } from "../../../core/src";
import { NodePackageManager } from "./NodePackageManager";
import { YarnSupport } from "./YarnSupport";
import { Author } from "./Author";
import { PackageDependency, PackageDependencyType } from "./PackageDependency";

export type Dependencies = { [key: string]: string } | string[];

export enum PackageManagerType {
  YARN,
  NPM,
}

export interface NodeProjectProps extends ProjectProps, NodePackageJsonProps {
  readonly packageName?: string;
  readonly packageManagerType?: PackageManagerType;
  readonly dependencies?: Dependencies;
  readonly devDependencies?: Dependencies;
  readonly peerDependencies?: Dependencies;
}

export class NodeProject extends Project {
  readonly gitignore: GitIgnore;
  readonly packageJson: NodePackageJson;
  readonly packageManager: NodePackageManager;

  constructor(scope: Workspace | XProject, id: string, props?: NodeProjectProps) {
    super(scope, id, props);

    if (props?.authorName || props?.authorEmail || props?.authorUrl || props?.authorOrganization) {
      new Author(this, "Author", {
        email: props.authorEmail,
        name: props.authorName,
        url: props.authorUrl,
        organization: props.authorOrganization,
      });
    }

    this.gitignore = new GitIgnore(this, "StandardIgnore", props?.gitignore ?? []);

    this.packageJson = new NodePackageJson(this, "PackageJson", {
      name: props?.packageName ?? id,
      ...props,
    });

    const addDependencies = (deps: Dependencies, type?: PackageDependencyType) => {
      if (Array.isArray(deps)) {
        deps.forEach((dep) => new PackageDependency(this, dep));
      } else {
        Object.keys(deps).forEach((dep) => new PackageDependency(this, dep, { version: deps[dep], type }));
      }
    };

    if (props?.dependencies) {
      addDependencies(props?.dependencies);
    }

    if (props?.devDependencies) {
      addDependencies(props?.devDependencies, PackageDependencyType.DEV);
    }

    if (props?.peerDependencies) {
      addDependencies(props?.peerDependencies, PackageDependencyType.PEER);
    }

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
