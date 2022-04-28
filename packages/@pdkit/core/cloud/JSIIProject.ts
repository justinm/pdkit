import { GitIgnore, ManifestEntry, XConstruct } from "../core";
import { EslintSupport, NodeProject, NodeProjectProps, PackageDependency, PackageDependencyType } from "../nodejs";
import { EslintImportRules } from "../nodejs/tools/eslint/EslintImportRules";
import { EslintTypescriptRules } from "../nodejs/tools/eslint/EslintTypescriptRules";

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

    new GitIgnore(this, [".jsii", "tsconfig.json"]);

    new PackageDependency(this, "typescript", { type: PackageDependencyType.DEV });
    new PackageDependency(this, "jsii-docgen", { type: PackageDependencyType.DEV });
    new PackageDependency(this, "jsii-pacmak", { type: PackageDependencyType.DEV });
    new PackageDependency(this, "publib", { type: PackageDependencyType.DEV });

    if (EslintSupport.hasSupport(this)) {
      new EslintImportRules(this, { fileExtensions: [".ts", ".tsx"], tsAlwaysTryTypes: true });
      new EslintTypescriptRules(this);
    }

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
        prebuild: "",
        build: `rsync -a . ${buildPath} --exclude .git --exclude node_modules && jsii`,
        clean: 'find . -name "*.js" -not -path "./node_modules/*" -delete && find . -name "*.d.ts" -not -path "./node_modules/*" -delete',
        package: "jsii-pacmak",
        docgen: "jsii-docgen",
        release: "bash $(yarn bin publib)",
      },
    });

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
