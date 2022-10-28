import { Construct } from "constructs";
import { GitIgnore, ManifestEntry } from "../../L2";
import { EslintSupport, NodeProject, NodeProjectProps, NpmIgnore, PackageDependency, PackageDependencyType } from "../nodejs";
import { EslintImportRules } from "../nodejs/tools/eslint/EslintImportRules";
import { EslintTypescriptRules } from "../nodejs/tools/eslint/EslintTypescriptRules";

export interface JSIIProjectProps
  extends Omit<NodeProjectProps, "tsconfig" | "license" | "repository">,
    Required<Pick<NodeProjectProps, "license" | "repository">> {
  readonly distPath?: string;
  readonly versionFormat?: string;
  readonly pypi?: {
    readonly distName: string;
    readonly module: string;
  };
}

export class JSIIProject extends NodeProject {
  constructor(scope: Construct, id: string, props: JSIIProjectProps) {
    super(scope, id, props);

    const buildPath = props.buildPath ?? "build";
    const distPath = props.distPath ?? "dist";
    const sourcePath = props.sourcePath ?? "src";

    new GitIgnore(this, "JsiiGitIgnore", [buildPath, distPath, ".jsii", "tsconfig.json"]);
    new NpmIgnore(this, "JsiiNpmIgnore", [buildPath, distPath, ".jsii", "tsconfig.json"]);

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
        build: `rsync -a . ${buildPath} --exclude .git --exclude node_modules && npx jsii`,
        clean: 'find . -name "*.js" -not -path "./node_modules/*" -delete && find . -name "*.d.ts" -not -path "./node_modules/*" -delete',
        package: "npx jsii-pacmak",
        docgen: "npx jsii-docgen",
        release: "npx publib",
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
