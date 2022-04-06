import path from "path";
import {
  GitIgnore,
  InstallShellScript,
  License,
  ManifestEntry,
  Project,
  ProjectProps,
  StandardValidator,
  ValidLicense,
  Workspace,
  XConstruct,
} from "../../core";
import { GithubSupport, GithubSupportProps } from "../../github";
import {
  Author,
  AuthorProps,
  NodePackageJsonProps,
  PackageDependency,
  PackageDependencyType,
  PackageJson,
} from "../constructs";
import {
  EslintProps,
  EslintSupport,
  JestProps,
  JestSupport,
  TypescriptSupport,
  TypescriptSupportProps,
} from "../tools";
import { YalcSupport } from "../tools/YalcSupport";

export type Dependencies = { [key: string]: string } | (string | { name: string; version: string })[];

export enum PackageManagerType {
  NPM,
  YARN,
}

export interface NodeProjectProps extends ProjectProps, NodePackageJsonProps {
  readonly packageName?: string;
  readonly installCommands?: string[];
  readonly dependencies?: Dependencies;
  readonly devDependencies?: Dependencies;
  readonly peerDependencies?: Dependencies;
  readonly author?: AuthorProps;
  readonly license?: ValidLicense;
  readonly eslint?: EslintProps & { enabled: boolean };
  readonly jest?: JestProps & { enabled: boolean };
  readonly yalc?: boolean;
  readonly tsconfig?: TypescriptSupportProps & { enabled: boolean };
  readonly prettier?: boolean;
  readonly gitignore?: string[];
  readonly buildCommands?: string[];
  readonly packageManagerType?: PackageManagerType;
  readonly packageJsonProps?: Partial<NodePackageJsonProps> & Record<string, unknown>;
  readonly disableAutoLib?: boolean;
  readonly github?: GithubSupportProps;
}

export class NodeProject extends Project {
  public static of(construct: any): NodeProject {
    return Project.of(construct) as NodeProject;
  }
  public readonly packageJson: PackageJson;
  public readonly packageName: string;

  constructor(scope: XConstruct, id: string, props?: NodeProjectProps) {
    super(scope, id, props);

    const tool = props?.packageManagerType ?? PackageManagerType.YARN;

    this.packageName = props?.packageName ?? id;
    this.packageJson = new PackageJson(this, {
      name: this.packageName,
      files: [path.join(this.distPath, "*.js"), path.join(this.distPath, "**/*.js")],
      ...props,
    });

    if (this.distPath !== this.sourcePath) {
      new GitIgnore(this, [this.distPath]);
    }

    if (props?.tsconfig?.enabled) {
      new TypescriptSupport(this, props.tsconfig);
    }

    if (props?.author) {
      new Author(this, props.author);
    }

    if (props?.license) {
      new License(this, props.license);
    }

    if (props?.eslint?.enabled) {
      new EslintSupport(this, props.eslint);
    }

    if (props?.jest?.enabled) {
      new JestSupport(this, props.jest);
    }

    if (props?.yalc) {
      new YalcSupport(this);
    }

    if (props?.github) {
      new GithubSupport(this, "Github", props.github);
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
      ".yalc",
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

    if (!props?.disableAutoLib && Project.of(this).isDefaultProject) {
      new PackageDependency(this, "@pdkit/core", { type: PackageDependencyType.DEV });
      new PackageDependency(this, "@pdkit/cli", { type: PackageDependencyType.DEV });
    }

    if (props?.scripts) {
      new ManifestEntry(this, "NpmEnsureScripts", { scripts: props.scripts });
    }

    let defaultInstallCommand: string[] | undefined;

    switch (tool) {
      case PackageManagerType.NPM:
        defaultInstallCommand = ["npm", "install"];
        break;
      case PackageManagerType.YARN:
        defaultInstallCommand = ["yarn"];
        new GitIgnore(this, [
          ".yarn/*",
          "!.yarn/releases",
          "!.yarn/patches",
          "!.yarn/plugins",
          "!.yarn/sdks",
          "!.yarn/versions",
          ".pnp.*",
          ".yarn-integrity",
        ]);
        break;
    }

    new InstallShellScript(this, "InstallCommand", props?.installCommands ?? defaultInstallCommand);
    new StandardValidator(this, "StandardValidator");

    if (props?.packageJsonProps) {
      new ManifestEntry(this, "ProvidedManifest", props.packageJsonProps);
    }
  }

  tryFindProject(packageName: string) {
    return Workspace.of(this)
      .node.findAll()
      .find((p) => (p as NodeProject).packageName === packageName) as NodeProject | undefined;
  }
}
