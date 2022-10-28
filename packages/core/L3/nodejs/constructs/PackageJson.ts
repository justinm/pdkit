import path from "path";
import { Construct } from "constructs";
import { Project, Workspace, FileSynthesizer, Fields, LifeCycle, LifeCycleStage } from "../../../L1";
import { Manifest, ValidLicense } from "../../../L2";
import { NodeProject } from "../project";

export interface NodePackageJsonProps {
  readonly name?: string;
  readonly description?: string;
  readonly version?: string;
  readonly private?: boolean;
  readonly license?: ValidLicense;
  readonly homepath?: string;
  readonly repository?: string | { readonly type: string; readonly url: string };
  readonly keywords?: string[];
  readonly main?: string;
  readonly types?: string;
  readonly bin?: Record<string, string>;
  readonly scripts?: Record<string, string>;
  readonly resolutions?: Record<string, string>;
  readonly bugs?: {
    readonly url?: string;
    readonly email?: string;
  };
  readonly files?: string[];
  readonly man?: string[];
}

// This determines the order at which package.json is written and is for visual purposes only
const packageOrdering = [
  "name",
  "description",
  "license",
  "repository",
  "version",
  "author",
  "bugs",
  "private",
  "main",
  "types",
  "bin",
  "man",
  "scripts",
  "files",
  "workspaces",
  "dependencies",
  "devDependencies",
  "peerDependencies",
  "bundledDependencies",
  "resolutions",
  "prettier",
  "eslintConfig",
  "jest",
];

export class PackageJson extends Manifest {
  public static readonly ID = "PackageJson";
  constructor(scope: Construct, props?: NodePackageJsonProps) {
    super(scope, PackageJson.ID, "package.json");

    const project = Project.of(this);

    const packageJson = FileSynthesizer.of(this).tryReadRealJsonFile<{
      [key: string]: any;
    }>(this, path.join(project.projectPath, "package.json"));

    const fields = Fields.of(this);

    if (props) {
      fields.addShallowFields({
        name: props.name,
        description: props.description,
        version: packageJson?.version ?? props.version ?? "0.0.0",
        private: props.private,
        homepath: props.homepath,
        repository: props.repository,
        keywords: props.keywords,
        main: props.main ?? `${project.buildPath}/index.js`,
        bin: props.bin,
        scripts: props.scripts,
        bugs: props.bugs,
        files: props.files,
        man: props.man,
        resolutions: props.resolutions,
        types: props.types,
      });
    }

    LifeCycle.of(this).on(LifeCycleStage.BEFORE_WRITE, () => {
      const addPackageDependency = (key: string, packageName: string, version: string) => {
        fields.addDeepFields({
          [key]: {
            [packageName]: version,
          },
        });
      };

      const projects = Workspace.of(this)
        .node.findAll()
        .filter((p) => p instanceof NodeProject) as NodeProject[];

      const ftrait = Fields.of(this);

      ["dependencies", "devDependencies", "peerDependencies"].forEach((key) => {
        if (ftrait.fields[key]) {
          const field = ftrait.fields[key] as Record<string, string>;

          for (const dep of Object.keys(field)) {
            if (field[dep] && field[dep] !== "*") {
              addPackageDependency(key, dep, field[dep]);
            } else {
              const pj = projects.find((p) => p.node.id === key);

              if (pj) {
                addPackageDependency(key, dep, `^${pj.packageJson.version}`);
              } else {
                const version = this.resolveDepVersion(dep);

                addPackageDependency(key, dep, version);
              }
            }
          }
        }

        // We need to sort our dependency keys to match npm/yarn
        if (ftrait.fields[key]) {
          ftrait.fields[key] = Object.keys(ftrait.fields[key] as any)
            .sort()
            .reduce((c, k) => {
              c[k] = (ftrait.fields[key] as Record<string, string>)[k];

              return c;
            }, {} as Record<string, string>);
        }
      });
    });

    LifeCycle.of(this).on(LifeCycleStage.BEFORE_WRITE, () => {
      fields.orderFields(packageOrdering);
    });
  }

  get version() {
    return Fields.of(this).fields.version as string;
  }

  resolveDepVersion(dep: string) {
    const project = Project.of(this);
    const fileSynthesizer = FileSynthesizer.of(this);

    const packageJson =
      fileSynthesizer.tryReadRealJsonFile<{ [key: string]: any }>(this, `node_modules/${dep}/package.json`) ||
      fileSynthesizer.tryReadRealJsonFile<{ [key: string]: any }>(this, `${project.projectPath}/node_modules/${dep}/package.json`);

    return packageJson?.version ?? "*";
  }
}
