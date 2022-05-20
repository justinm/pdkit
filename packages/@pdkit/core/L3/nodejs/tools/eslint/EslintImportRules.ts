import { Construct } from "constructs";
import { Project, LifeCycle, LifeCycleStage } from "../../../../L1";
import { PackageDependency, PackageDependencyType } from "../../constructs";
import { TypescriptSupport } from "../TypescriptSupport";
import { EslintSupport } from "./EslintSupport";

export interface EslintImportRulesProps {
  /**
   * Install eslint dependencies (i.e. plugins and configs) for the project. Defaults to true
   */
  readonly install?: boolean;

  /**
   * Enable import alias for module paths
   * @default undefined
   */
  readonly aliasMap?: { [key: string]: string };

  /**
   * Enable import alias for module paths
   * @default undefined
   */
  readonly aliasExtensions?: string[];

  /**
   * A list of file extensions that should be importable
   *
   * @default [".js", ".jsx"]
   */
  readonly fileExtensions?: string[];

  /**
   * Always try to resolve types under `<root>@types` directory even it doesn't contain any source code.
   * This prevents `import/no-unresolved` eslint errors when importing a `@types/*` module that would otherwise remain unresolved.
   * @default true
   */
  readonly tsAlwaysTryTypes?: boolean;

  /**
   * Patterns with source files that include tests and build tools. These
   * sources are linted but may also import packages from `devDependencies`.
   * @default []
   */
  readonly devSourcePatterns?: string[];
}

export class EslintImportRules extends Construct {
  constructor(scope: Construct, props?: EslintImportRulesProps) {
    super(scope, "EslintImportRules");

    if (props?.install ?? true) {
      new PackageDependency(this, "eslint-import-resolver-node", {
        type: PackageDependencyType.DEV,
      });

      new PackageDependency(this, "eslint-plugin-import", {
        type: PackageDependencyType.DEV,
      });

      new PackageDependency(this, "eslint-import-resolver-alias", {
        type: PackageDependencyType.DEV,
      });
    }

    LifeCycle.implement(this);
    LifeCycle.of(this).on(LifeCycleStage.BEFORE_SYNTH, () => {
      const project = Project.of(this);
      const tsSupport = TypescriptSupport.tryOf(project);
      const eslint = EslintSupport.of(this);

      eslint.addRules({
        // Require all imported dependencies are actually declared in package.json
        "import/no-extraneous-dependencies": [
          "error",
          {
            // Only allow importing devDependencies from "devdirs".
            devDependencies: Array.from(new Set(props?.devSourcePatterns ?? ["**/__tests__/**", "**/test/**"])),
            optionalDependencies: false, // Disallow importing optional dependencies (those shouldn't be in use in the project)
            peerDependencies: true, // Allow importing peer dependencies (that aren't also direct dependencies)
          },
        ],

        // Require all imported libraries actually resolve (!!required for import/no-extraneous-dependencies to work!!)
        "import/no-unresolved": ["error"],

        // Require an ordering on all imports
        "import/order": [
          "warn",
          {
            groups: ["builtin", "external"],
            alphabetize: { order: "asc", caseInsensitive: true },
          },
        ],
      });

      eslint.extends.add("plugin:import/recommended");

      eslint.settings["import/parsers"] = {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      };
      eslint.settings["import/resolver"] = {
        alias: {},
        node: {
          extensions: props?.fileExtensions ?? [".js", ".jsx"].concat(!!tsSupport ? [".ts", ".tsx"] : []),
        },
        typescript:
          !!tsSupport || !!props?.tsAlwaysTryTypes
            ? {
                project: tsSupport?.fileName ?? "tsconfig.json",
                ...(props?.tsAlwaysTryTypes !== false && {
                  alwaysTryTypes: true,
                }),
              }
            : undefined,
      };

      if (props?.aliasMap || props?.aliasExtensions) {
        eslint.settings["import/resolver"].alias.map = Object.entries(props.aliasMap ?? {}).map(([k, v]) => [k, v]);
        eslint.settings["import/resolver"].alias.extensions = props.aliasExtensions;
      }
    });
  }
}
