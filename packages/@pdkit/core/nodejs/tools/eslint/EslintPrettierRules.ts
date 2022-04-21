import { LifeCycle, ManifestEntry, Project, XConstruct } from "../../../core";
import { PackageDependency, PackageDependencyType } from "../../constructs";
import { EslintSupport } from "./EslintSupport";

export interface EslintPrettierRulesProps {
  /**
   * Install Eslint for the project. Defaults to true
   */
  readonly install?: boolean;

  /**
   * Require double quotes when possible vs single quotes. Defaults to true.
   */
  readonly doubleQuotes?: boolean;

  readonly lineWidth?: number;
}

export class EslintPrettierRules extends XConstruct {
  constructor(scope: XConstruct, props: EslintPrettierRulesProps) {
    super(scope, "EslintPrettierRules");

    const lineWidth = props.lineWidth ?? 80;
    const project = Project.of(this);

    if (props?.install ?? true) {
      new PackageDependency(this, "prettier", {
        type: PackageDependencyType.DEV,
      });
      new PackageDependency(this, "eslint-plugin-prettier", {
        type: PackageDependencyType.DEV,
      });
      new PackageDependency(this, "eslint-config-prettier", {
        type: PackageDependencyType.DEV,
      });
    }

    this.addLifeCycleScript(LifeCycle.BEFORE_SYNTH, () => {
      const eslint = EslintSupport.of(project);

      eslint.plugins.add("prettier");
      eslint.extends.add("prettier");

      eslint.rules["prettier/prettier"] = [
        "error",
        {
          singleQuote: !(props.doubleQuotes ?? true),
          quoteProps: "consistent",
        },
      ];

      new ManifestEntry(this, "PrettierConfig", {
        prettier: {
          printWidth: lineWidth,
          singleQuote: !(props.doubleQuotes ?? true),
          quoteProps: "consistent",
        },
      });
    });
  }
}
