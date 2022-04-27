import { GitIgnore, ManifestEntry, XConstruct } from "../core";
import { NodeProject, NodeProjectProps, PackageDependency, PackageDependencyType } from "../nodejs";

export interface JSIIProjectProps extends Omit<NodeProjectProps, "tsconfig"> {
  readonly distPath?: string;
  readonly versionFormat?: string;
  readonly pypi?: {
    readonly distName: string;
    readonly module: string;
  };
}

export class JSIIProject extends NodeProject {
  constructor(scope: XConstruct, id: string, props: JSIIProjectProps) {
    super(scope, id, props);

    const buildPath = props.buildPath ?? "build";
    const distPath = props.distPath ?? "dist";
    const sourcePath = props.sourcePath ?? "src";

    new GitIgnore(this, [buildPath, sourcePath, distPath]);

    new ManifestEntry(this, "JSII", {
      types: `${buildPath}/index.d.ts`,
      jsii: {
        outdir: distPath,
        versionFormat: props.versionFormat ?? "short",
        tsc: {
          outDir: buildPath,
          rootDir: sourcePath,
        },
        excludeTypescript: ["src/lambdas", "src/**/__tests__"],
      },
      scripts: {
        build: "jsii",
        package: "jsii-pacmak",
        docgen: "jsii-docgen",
        release: 'NPM_TOKEN="" bash $(yarn bin publib)',
      },
    });

    new GitIgnore(this, [".jsii", "tsconfig.json"]);

    new PackageDependency(this, "typescript", { type: PackageDependencyType.DEV });
    new PackageDependency(this, "jsii-docgen", { type: PackageDependencyType.DEV });
    new PackageDependency(this, "jsii-pacmak", { type: PackageDependencyType.DEV });
    new PackageDependency(this, "publib", { type: PackageDependencyType.DEV });

    if (props.pypi) {
      new ManifestEntry(this, "PyPi", {
        jsii: {
          targets: {
            python: {
              distName: props.pypi.distName,
              module: props.pypi.module,
            },
          },
        },
      });
    }
  }
}
