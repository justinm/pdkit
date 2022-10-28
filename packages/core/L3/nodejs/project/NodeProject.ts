import path from "path";
import * as Case from "case";
import { Construct } from "constructs";
import { InstallShellScript, LifeCycle, LifeCycleStage, Project, ProjectProps, Workspace } from "../../../L1";
import { GitIgnore, License, ManifestEntry, ValidLicense } from "../../../L2";
import { Author, AuthorProps, NodePackageJsonProps, PackageDependency, PackageDependencyType, PackageJson } from "../constructs";
import { EslintProps, EslintSupport, JestProps, JestSupport, TypescriptSupport, TypescriptSupportProps } from "../tools";
import { YalcSupport } from "../tools/YalcSupport";

export type Dependencies = { [key: string]: string } | (string | { name: string; version: string })[];

export enum PackageManagerType {
  NPM,
  YARN,
}

export interface NodeProjectProps extends ProjectProps, NodePackageJsonProps {
  /**
   * Define the name of the project, ie my-cool-library, @org/my-cool-library
   */
  readonly packageName?: string;

  /**
   * Specify the commands that should run during the install phase. Typically this is a call
   * to a package manager like Yarn or NPM.
   */
  readonly installCommands?: string[];

  /**
   * A list of package dependencies required for the project. Dependencies can be added using a simple
   * string or a more complex object. String dependencies automatically installs the latest package version.
   *
   * Please note, StackGen uses pinning for installed packages. To update a package, refer to your package manager's
   * install process and resynth.
   */
  readonly dependencies?: Dependencies;

  /**
   * A list of package devDependencies required for the project. Dependencies can be added using a simple
   * string or a more complex object. String dependencies automatically installs the latest package version.
   *
   * Please note, StackGen uses pinning for installed packages. To update a package, refer to your package manager's
   * install process and resynth.
   */
  readonly devDependencies?: Dependencies;

  /**
   * A list of package peerDependencies required for the project. Dependencies can be added using a simple
   * string or a more complex object. String dependencies automatically installs the latest package version.
   *
   * Please note, StackGen uses pinning for installed packages. To update a package, refer to your package manager's
   * install process and resynth.
   */
  readonly peerDependencies?: Dependencies;

  /**
   * A list of package bundledDependencies required for the project. Dependencies can be added using a simple
   * string or a more complex object. String dependencies automatically installs the latest package version.
   *
   * Please note, StackGen uses pinning for installed packages. To update a package, refer to your package manager's
   * install process and resynth.
   */
  readonly bundledDependencies?: string[];

  /**
   * Defines the package's author.
   */
  readonly author?: AuthorProps;

  /**
   * Defines the project's licensing. StackGen automatically maintains a LICENSE.md.
   */
  readonly license?: ValidLicense;

  /**
   * Defines project specific settings for eslint.
   */
  readonly eslint?: EslintProps;

  /**
   * Defines project specific settings for jest.
   */
  readonly jest?: JestProps;
  readonly yalc?: boolean;

  /**
   * Defines project specific settings for Typescript support.
   */
  readonly typescript?: TypescriptSupportProps;

  /**
   * Defines additional file patterns to exclude from git
   */
  readonly gitignore?: string[];

  /**
   * Configures the packageManager for the project.
   */
  readonly packageManagerType?: PackageManagerType;

  /**
   * Adds or overrides packageJson properties.
   */
  readonly packageJsonProps?: Partial<NodePackageJsonProps> & Record<string, unknown>;

  /**
   * Disable StackGen's automatic library inclusion.
   *
   * Note: Setting this property may result in uninstalling StackGen!
   */
  readonly disableAutoLib?: boolean;

  /**
   * Define package resolutions
   */
  readonly resolutions?: Record<string, string>;
}

export class NodeProject extends Project {
  public static of(construct: any): NodeProject {
    return Project.of(construct) as NodeProject;
  }
  public readonly packageJson: PackageJson;
  public readonly packageName: string;

  constructor(scope: Construct, id: string, props?: NodeProjectProps) {
    super(scope, id, props);

    const tool = props?.packageManagerType ?? PackageManagerType.NPM;

    this.packageName = props?.packageName ?? Case.kebab(id);
    this.packageJson = new PackageJson(this, {
      name: this.packageName,
      files: [path.join(this.buildPath, "*.js"), path.join(this.buildPath, "**/*.js")],
      ...props,
    });

    if (this.buildPath !== this.sourcePath) {
      new GitIgnore(this, "DistPath", [this.buildPath]);
    }

    if (props?.typescript) {
      new TypescriptSupport(this, props.typescript);
    }

    if (props?.author) {
      new Author(this, props.author);
    }

    if (props?.license) {
      new License(this, props.license);
    }

    if (props?.eslint) {
      new EslintSupport(this, props.eslint);
    }

    if (props?.jest) {
      new JestSupport(this, props.jest);
    }

    if (props?.yalc) {
      new YalcSupport(this);
    }

    // Courtesy of https://www.toptal.com/developers/gitignore/api/node
    new GitIgnore(this, "NodeJsIgnore", [
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
      ...(props?.gitignore ?? []),
    ]);

    if (props?.bundledDependencies) {
      this.addDependencies(props?.bundledDependencies, PackageDependencyType.BUNDLED);
    }

    if (props?.dependencies) {
      this.addDependencies(props?.dependencies);
    }

    if (props?.devDependencies) {
      this.addDependencies(props?.devDependencies, PackageDependencyType.DEV);
    }

    if (props?.peerDependencies) {
      this.addDependencies(props?.peerDependencies, PackageDependencyType.PEER);
    }

    if (!props?.disableAutoLib && Project.of(this).isDefaultProject) {
      new PackageDependency(this, "@stackgen/core", { type: PackageDependencyType.DEV });
      new PackageDependency(this, "@stackgen/cli", { type: PackageDependencyType.DEV });
    }

    let defaultInstallCommand: string[] | undefined;

    switch (tool) {
      case PackageManagerType.NPM:
      default:
        defaultInstallCommand = ["npm", "install"];
        break;
      case PackageManagerType.YARN:
        defaultInstallCommand = ["yarn"];
        new GitIgnore(this, "YarnIgnore", [
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

    LifeCycle.implement(this);
    LifeCycle.of(this).on(LifeCycleStage.SYNTH, () => {
      if (props?.scripts) {
        new ManifestEntry(this, "NpmEnsureScripts", { scripts: props.scripts });
      }

      if (props?.packageJsonProps) {
        new ManifestEntry(this, "ProvidedManifest", props.packageJsonProps);
      }
    });
  }

  tryFindProject(packageName: string) {
    return Workspace.of(this)
      .node.findAll()
      .find((p) => (p as NodeProject).packageName === packageName) as NodeProject | undefined;
  }

  addDependencies(deps: Dependencies, type?: PackageDependencyType) {
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

    return this;
  }
}
