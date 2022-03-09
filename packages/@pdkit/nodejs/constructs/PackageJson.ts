import { ValidLicense, Manifest, XConstruct, FileSystem } from "@pdkit/core";

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
  constructor(scope: XConstruct, id: string, props?: NodePackageJsonProps) {
    super(scope, id, "package.json");

    const packageJson = FileSystem.of(this).tryReadJsonFile<{ [key: string]: any }>("package.json");

    if (props) {
      this.addShallowFields({
        name: props.name,
        description: props.description,
        version: props.version ?? packageJson?.version ?? "0.0.0",
        private: props.private,
        homepath: props.homepath,
        repository: props.repository,
        keywords: props.keywords,
        main: props.main,
        bin: props.bin,
        scripts: props.scripts,
        bugs: props.bugs,
        files: props.files,
        man: props.man,
      });
    }

    // new UpdatePackageVersionsPostInstallScript(this, "PatchPackageJson");
  }

  get version() {
    return this.fields.version as string;
  }

  resolveDepVersion(dep: string) {
    const packageJson = FileSystem.of(this).tryReadJsonFile<{ [key: string]: any }>(`node_modules/${dep}/package.json`);

    return packageJson?.version ?? "*";
  }

  _onSynth() {
    super._onSynth();

    const addPackageDependency = (key: string, packageName: string, version: string) => {
      this.addDeepFields({
        [key]: {
          [packageName]: version,
        },
      });
    };

    ["dependencies", "devDependencies", "peerDependencies", "bundledDependencies"].forEach((key) => {
      if (this.fields[key]) {
        for (const dep of Object.keys(this.fields[key] as Record<string, string>)) {
          const version = this.resolveDepVersion(dep);

          if (version) {
            addPackageDependency(key, dep, `^${version}`);
          }
        }
      }
    });
  }
}
