import { Construct } from "constructs";
import { LifeCycle, LifeCycleStage, Project } from "../../../../L1";
import { PackageDependency, PackageDependencyType } from "../../constructs";
import { TypescriptSupport } from "../TypescriptSupport";
import { EslintSupport } from "./EslintSupport";

export interface EslintTypescriptRulesProps {
  /**
   * Install Eslint for the project. Defaults to true
   */
  readonly install?: boolean;
}

export class EslintTypescriptRules extends Construct {
  constructor(scope: Construct, props?: EslintTypescriptRulesProps) {
    super(scope, "EslintTypescriptRules");

    const project = Project.of(this);

    if (props?.install ?? true) {
      new PackageDependency(this, "@typescript-eslint/eslint-plugin", {
        type: PackageDependencyType.DEV,
      });
      new PackageDependency(this, "@typescript-eslint/parser", {
        type: PackageDependencyType.DEV,
      });
      new PackageDependency(this, "eslint-import-resolver-typescript", {
        type: PackageDependencyType.DEV,
      });
    }

    LifeCycle.implement(this);
    LifeCycle.of(this).on(LifeCycleStage.BEFORE_SYNTH, () => {
      const eslint = EslintSupport.of(project);
      const tsSupport = TypescriptSupport.tryOf(project);

      eslint.plugins.add("@typescript-eslint");
      eslint.extends.add("plugin:import/typescript");

      eslint.fileExtensions.add("ts");
      eslint.fileExtensions.delete("js");

      eslint.ignorePatterns.push("*.js");
      eslint.ignorePatterns.push("*.d.ts");

      eslint.settings["import/parsers"] = {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      };

      eslint.parser = "@typescript-eslint/parser";
      eslint.parserOptions.ecmaVersion = 2020;
      eslint.parserOptions.sourceType = "module";
      eslint.parserOptions.project = `./${tsSupport?.fileName ?? "tsconfig.json"}`;

      eslint.addRules({
        // see https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/indent.md
        "indent": ["off"],
        "@typescript-eslint/member-delimiter-style": ["error"],
        // Require use of the `import { foo } from 'bar';` form instead of `import foo = require('bar');`
        "@typescript-eslint/no-require-imports": ["error"],
        "@typescript-eslint/no-shadow": ["error"],
        // One of the easiest mistakes to make
        "@typescript-eslint/no-floating-promises": ["error"],
        "@typescript-eslint/return-await": ["error"],
        // Member ordering
        "@typescript-eslint/member-ordering": [
          "error",
          {
            default: [
              "public-static-field",
              "public-static-method",
              "protected-static-field",
              "protected-static-method",
              "private-static-field",
              "private-static-method",
              "field",

              // Constructors
              "constructor", // = ["public-constructor", "protected-constructor", "private-constructor"]

              // Methods
              "method",
            ],
          },
        ],
      });
    });
  }
}
