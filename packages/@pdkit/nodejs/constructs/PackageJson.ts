import { LifeCycle, Manifest, Project, ValidLicense, Workspace, XConstruct } from "@pdkit/core";

export interface NodePackageJsonProps {
  readonly name?: string;
  readonly description?: string;
  readonly version?: string;
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

export class PackageJson extends Manifest {
  constructor(scope: XConstruct, props?: NodePackageJsonProps) {
    super(scope, "package.json");

    const packageJson = Workspace.of(this).fileSynthesizer.tryReadRealJsonFile<{ [key: string]: any }>(
      this,
      "package.json"
    );

    if (props) {
      const project = Project.of(this);

      this.addShallowFields({
        name: props.name,
        description: props.description,
        version: props.version ?? packageJson?.version ?? "0.0.0",
        private: props.private,
        homepath: props.homepath,
        repository: props.repository,
        keywords: props.keywords,
        main: props.main ?? `${project.distPath}/index.js`,
        bin: props.bin,
        scripts: props.scripts,
        bugs: props.bugs,
        files: props.files,
        man: props.man,
      });
    }

    this.addLifeCycleScript(LifeCycle.SYNTH, () => {
      const addPackageDependency = (key: string, packageName: string, version: string) => {
        this.addDeepFields({
          [key]: {
            [packageName]: version,
          },
        });
      };

      ["dependencies", "devDependencies", "peerDependencies", "bundledDependencies"].forEach((key) => {
        if (this.fields[key]) {
          const field = this.fields[key] as Record<string, string>;

          for (const dep of Object.keys(field)) {
            const version = `${this.resolveDepVersion(dep)}`;

            addPackageDependency(key, dep, version);
          }
        }
      });
    });
  }

  get version() {
    return this.fields.version as string;
  }

  resolveDepVersion(dep: string) {
    const project = Project.of(this);
    const workspace = Workspace.of(this);

    const packageJson =
      workspace.fileSynthesizer.tryReadRealJsonFile<{ [key: string]: any }>(this, `node_modules/${dep}/package.json`) ||
      workspace.fileSynthesizer.tryReadRealJsonFile<{ [key: string]: any }>(
        this,
        `${project.projectPath}/node_modules/${dep}/package.json`
      );

    return packageJson?.version ?? "*";
  }
}
