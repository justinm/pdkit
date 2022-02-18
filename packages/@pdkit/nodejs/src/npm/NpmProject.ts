import {
  InstallShellScript,
  License,
  Project,
  ProjectProps,
  TaskManager,
  ValidLicense,
  Workspace,
  XConstruct,
} from "@pdkit/core/src";
import { VirtualFS } from "@pdkit/core/src/constructs/VirtualFS";
import { StandardValidator } from "@pdkit/core/src/validation/StandardValidator";
import { Author, AuthorProps } from "../constructs/Author";
import { PackageDependency, PackageDependencyType } from "../constructs/PackageDependency";
import { PackageJson, NodePackageJsonProps } from "../constructs/PackageJson";
import { EslintProps, EslintSupport } from "../eslint/EslintSupport";
import { JestOptions, JestSupport } from "../jest/JestSupport";

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
  readonly eslint?: EslintProps & { enabled: boolean };
  readonly jest?: JestOptions & { enabled: boolean };
  readonly prettier?: boolean;
}

export class NpmProject extends Project {
  public readonly packageJson: PackageJson;
  public readonly packageName: string;

  constructor(scope: XConstruct, id: string, props?: NodeProjectProps) {
    super(scope, id, props);

    new InstallShellScript(this, "InstallCommand", [props?.installCommand ?? "npm install"]);
    new VirtualFS(this, "VirtualFS");
    new StandardValidator(this, "StandardValidator");
    new TaskManager(this, "TaskManager");

    this.packageName = props?.packageName ?? id;
    this.packageJson = new PackageJson(this, "PackageJson", {
      name: this.packageName,
      files: [`${this.distPath}/*.js`, `${this.distPath}/**/*.js`],
      ...props,
    });

    if (props?.license) {
      new License(this, "License", props.license);
    }

    if (props?.author) {
      new Author(this, "Author", props.author);
    }

    if (props?.eslint?.enabled) {
      new EslintSupport(this, "EslintSupport", props.eslint);
    }

    if (props?.jest?.enabled) {
      new JestSupport(this, "JestSupport", props.jest);
    }

    const addDependencies = (deps: Dependencies, type?: PackageDependencyType) => {
      if (Array.isArray(deps)) {
        deps.forEach((dep) => {
          const d = dep as { name: string; version?: string };

          if (d.name) {
            new PackageDependency(this, d.name, { version: d.version, type });
          } else {
            new PackageDependency(this, dep as string, { type });
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

  tryFindProject(packageName: string) {
    return Workspace.of(this).projects.find((p) => (p as NpmProject).packageName === packageName);
  }
}
