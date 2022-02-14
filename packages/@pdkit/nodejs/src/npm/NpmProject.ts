import { PackageJson, NodePackageJsonProps } from "../constructs/PackageJson";
import { InstallScript, License, Project, ProjectProps, ValidLicense, XConstruct } from "../../../core/src";
import { Author, AuthorProps } from "../constructs/Author";
import { PackageDependency, PackageDependencyType } from "../constructs/PackageDependency";
import { StandardValidator } from "../../../core/src/validation/StandardValidator";
import { VirtualFS } from "../../../core/src/constructs/VirtualFS";
import { TaskManager } from "../../../core/src/constructs/TaskManager";

export type Dependencies = { [key: string]: string } | (string | { name: string; version: string })[];

export enum PackageManagerType {
  YARN,
  NPM,
  NONE,
}

export interface NodeProjectProps extends ProjectProps, NodePackageJsonProps {
  readonly packageName?: string;
  readonly installCommand?: string;
  readonly dependencies?: Dependencies;
  readonly devDependencies?: Dependencies;
  readonly peerDependencies?: Dependencies;
  readonly author?: AuthorProps;
  readonly license?: ValidLicense;
}

export class NpmProject extends Project {
  readonly packageJson: PackageJson;

  constructor(scope: XConstruct, id: string, props?: NodeProjectProps) {
    super(scope, id, props);

    new InstallScript(this, "InstallCommand", [props?.installCommand ?? "npm install"]);
    new VirtualFS(this, "VirtualFS");
    new StandardValidator(this, "StandardValidator");
    new TaskManager(this, "TaskManager");

    if (props?.license) {
      new License(this, "License", props.license);
    }

    if (props?.author) {
      new Author(this, "Author", props.author);
    }

    this.packageJson = new PackageJson(this, "PackageJson", {
      name: props?.packageName ?? id,
      ...props,
    });

    const addDependencies = (deps: Dependencies, type?: PackageDependencyType) => {
      if (Array.isArray(deps)) {
        deps.forEach((dep) => {
          const d = dep as { name: string; version?: string };

          if (d.name) {
            new PackageDependency(this, d.name, { version: d.version });
          } else {
            new PackageDependency(this, dep as string);
          }
        });
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
  }
}
