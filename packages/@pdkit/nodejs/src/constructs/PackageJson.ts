import { ValidLicense, Manifest, XConstruct } from "@pdkit/core/src";
import { NpmProject } from "../npm/NpmProject";
import { UpdatePackageVersionsPostInstallScript } from "../scripts/UpdatePackageVersionsPostInstallScript";

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

    if (props) {
      this.addFields({
        name: props.name,
        description: props.description,
        version: props.version ?? "0.0.0",
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

    new UpdatePackageVersionsPostInstallScript(this, "PatchPackageJson");
  }

  _synth() {
    super._synth();

    const packageJson = NpmProject.of(this).tryReadJsonFile<{ [key: string]: any }>("package.json");

    if (packageJson) {
      this.addFields({ version: packageJson.version });

      ["dependencies", "devDependencies", "peerDependencies", "bundledDependencies"].forEach((key) => {
        if (this.fields[key]) {
          const deps = this.fields[key] as { [key: string]: string };

          Object.keys(deps).forEach((d) => {
            if (deps[d] === "*" && packageJson[key] && packageJson[key][d]) {
              this.addFields({
                [key]: {
                  [d]: packageJson[key][d],
                },
              });
            }
          });
        }
      });
    }
  }
}
