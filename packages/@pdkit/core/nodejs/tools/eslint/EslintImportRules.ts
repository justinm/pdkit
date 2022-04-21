import { LifeCycle, Project, XConstruct } from "../../../core";
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

export class EslintImportRules extends XConstruct {
  constructor(scope: XConstruct, props?: EslintImportRulesProps) {
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

    this.addLifeCycleScript(LifeCycle.BEFORE_SYNTH, () => {
      const project = Project.of(this);
      const eslint = EslintSupport.of(project);
      const tsSupport = TypescriptSupport.tryOf(project);

      eslint.extends.add("plugin:import/recommended");

      if (!!tsSupport) {
        eslint.extends.add("plugin:import/typescript");
      }

      eslint.settings["import/parsers"] = {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      };
      eslint.settings["import/resolver"] = {
        alias: {},
        node: {},
        typescript: !!tsSupport
          ? {
              project: tsSupport.fileName,
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
    });
  }
}
