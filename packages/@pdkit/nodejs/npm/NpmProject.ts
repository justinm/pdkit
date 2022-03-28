import {
  GitIgnore,
  InstallShellScript,
  License,
  Project,
  ProjectProps,
  ValidLicense,
  StandardValidator,
  Workspace,
  XConstruct,
  ManifestEntry,
} from "@pdkit/core";
import {
  Author,
  AuthorProps,
  PackageDependency,
  PackageDependencyType,
  PackageJson,
  NodePackageJsonProps,
} from "../constructs";
import { EslintProps, EslintSupport } from "../eslint";
import { JestProps, JestSupport } from "../jest";

export type Dependencies = { [key: string]: string } | (string | { name: string; version: string })[];

export enum PackageManagerType {
  YARN,
  NPM,
  NONE,
}

export interface NpmProjectProps extends ProjectProps, NodePackageJsonProps {
  readonly packageName?: string;
  readonly installCommands?: string[];
  readonly dependencies?: Dependencies;
  readonly devDependencies?: Dependencies;
  readonly peerDependencies?: Dependencies;
  readonly author?: AuthorProps;
  readonly license?: ValidLicense;
  readonly eslint?: EslintProps & { enabled: boolean };
  readonly jest?: JestProps & { enabled: boolean };
  readonly prettier?: boolean;
  readonly gitignore?: string[];
  readonly buildCommands?: string[];
}

export class NpmProject extends Project {
  public static of(construct: any): NpmProject {
    return Project.of(construct) as NpmProject;
  }
  public readonly packageJson: PackageJson;
  public readonly packageName: string;

  constructor(scope: XConstruct, id: string, props?: NpmProjectProps) {
    super(scope, id, props);

    new InstallShellScript(this, "InstallCommand", props?.installCommands ?? ["npm install"]);
    new StandardValidator(this, "StandardValidator");

    this.packageName = props?.packageName ?? id;
    this.packageJson = new PackageJson(this, {
      name: this.packageName,
      files: [`${this.distPath}/*.js`, `${this.distPath}/**/*.js`],
      ...props,
    });

    if (props?.license) {
      new License(this, props.license);
    }

    if (props?.author) {
      new Author(this, props.author);
    }

    if (props?.eslint?.enabled) {
      new EslintSupport(this, props.eslint);
    }

    if (props?.jest?.enabled) {
      new JestSupport(this, props.jest);
    }

    // Courtesy of https://www.toptal.com/developers/gitignore/api/node
    new GitIgnore(this, [
      "node_modules",
      "logs",
      "*.log",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",
      "report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json",
      "pids",
      "*.pid",
      "*.seed",
      "*.pid.lock",
      ".npm",
      "*.tgz",
    ]);

    if (props?.gitignore) {
      new GitIgnore(this, props.gitignore);
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

    if (props?.scripts) {
      new ManifestEntry(this, "EnsureScripts", { scripts: props.scripts });
    }
  }

  tryFindProject(packageName: string) {
    return Workspace.of(this)
      .node.findAll()
      .find((p) => (p as NpmProject).packageName === packageName) as NpmProject | undefined;
  }
}
