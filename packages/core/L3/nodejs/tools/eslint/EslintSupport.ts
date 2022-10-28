import { Construct } from "constructs";
import { JsonFile, ManifestEntry, SG_CONFIG_FILE } from "../../../../index";
import { Project, Bindings, Fields, LifeCycle, LifeCycleStage } from "../../../../L1";
import { PackageDependency, PackageDependencyType } from "../../constructs";
import { JestSupport } from "../JestSupport";
import { TypescriptSupport } from "../TypescriptSupport";
import { EslintImportRules, EslintImportRulesProps } from "./EslintImportRules";
import { EslintPrettierRules, EslintPrettierRulesProps } from "./EslintPrettierRules";
import { EslintTypescriptRules, EslintTypescriptRulesProps } from "./EslintTypescriptRules";

export interface EslintProps {
  /**
   * Install Eslint for the project. Defaults to true
   */
  readonly install?: boolean;

  /**
   * Path to JSON config file for Eslint
   *
   * @default - No separate config file, eslint settings are stored in package.json
   */
  readonly configFilePath?: string | boolean;

  /**
   * Install a specific version of eslint
   */
  readonly version?: string;

  readonly lineWidth?: number;

  readonly doubleQuotes?: boolean;

  /**
   * Enable Prettier
   */
  readonly prettier?: EslintPrettierRulesProps;

  readonly import?: EslintImportRulesProps;

  readonly typescript?: EslintTypescriptRulesProps;

  /**
   * File types that should be linted (e.g. [ "js", "ts" ])
   * @default ["js"]
   */
  readonly fileExtensions?: string[];

  readonly settings?: Record<string, any>;

  /**
   * List of file patterns that should not be linted, using the same syntax
   * as .gitignore patterns.
   *
   * @default [ '*.js', '*.d.ts', 'node_modules/', '*.generated.ts', 'coverage' ]
   */
  readonly ignorePatterns?: string[];

  readonly extraPlugins?: string[];
  readonly extends?: string[];
  readonly rules?: Record<string, unknown>;

  readonly parser?: string;
  readonly parserOptions?: { [key: string]: any };
}

export class EslintSupport extends Construct {
  public static hasSupport(construct: Construct) {
    return !!this.tryOf(construct);
  }

  public static of(construct: Construct) {
    const ret = this.tryOf(construct);

    if (!ret) {
      throw new Error(`Construct ${construct} does not have EslintSupport`);
    }

    return ret;
  }

  public static tryOf(construct: Construct) {
    return Bindings.of(Project.of(construct)).findByClass<EslintSupport>(EslintSupport);
  }

  public readonly rules: Record<string, unknown> = {};
  public readonly plugins: Set<string>;
  public readonly extends: Set<string>;
  public readonly fileExtensions: Set<string>;
  public readonly ignorePatterns: string[] = [];
  public readonly settings: Record<string, any>;
  public parser?: string;
  public readonly parserOptions: { [key: string]: any };

  constructor(scope: Construct, props: EslintProps) {
    super(scope, "EslintSupport");

    this.parser = props.parser;
    this.parserOptions = props.parserOptions ?? {};
    this.plugins = new Set(props.extraPlugins ?? []);
    this.extends = new Set(props.extends ?? []);
    this.fileExtensions = new Set(props.fileExtensions ?? ["js"]);
    this.ignorePatterns = props.ignorePatterns ?? ["node_modules/", "*.generated.ts", "coverage"];
    this.settings = props.settings ?? {};

    const lineWidth = props.lineWidth ?? 80;
    let rules = props.rules ?? {};

    Bindings.of(Project.of(this)).bind(this);

    const project = Project.of(this);

    if (props?.install ?? true) {
      new PackageDependency(this, "eslint", {
        type: PackageDependencyType.DEV,
        version: props.version,
      });
    }

    if (!this.parserOptions.ecmaVersion) {
      this.parserOptions.ecmaVersion = 2020;
    }

    this.rules = {
      // Max line lengths
      "max-len": [
        "error",
        {
          code: lineWidth,
          ignoreUrls: true, // Most common reason to disable it
          ignoreStrings: true, // These are not fantastic but necessary for error messages
          ignoreTemplateLiterals: true,
          ignoreComments: true,
          ignoreRegExpLiterals: true,
        },
      ],
      // Style
      "quotes": ["error", props.doubleQuotes ?? true ? "double" : "single", { avoidEscape: true }],

      // Required spacing in property declarations (copied from TSLint, defaults are good)
      "key-spacing": ["error"],

      "comma-dangle": ["error", "only-multiline"], // ensures clean diffs, see https://medium.com/@nikgraf/why-you-should-enforce-dangling-commas-for-multiline-statements-d034c98e36f8
      "comma-spacing": ["error", { before: false, after: true }], // space after, no space before
      "no-multi-spaces": ["error", { ignoreEOLComments: false }], // no multi spaces
      "array-bracket-spacing": ["error", "never"], // [1, 2, 3]
      "array-bracket-newline": ["error", "consistent"], // enforce consistent line breaks between brackets
      "object-curly-spacing": ["error", "always"], // { key: 'value' }
      "object-curly-newline": ["error", { multiline: true, consistent: true }], // enforce consistent line breaks between braces
      "object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }], // enforce "same line" or "multiple line" on object properties
      "keyword-spacing": ["error"], // require a space before & after keywords

      // Cannot import from the same module twice
      "no-duplicate-imports": ["error"],
      "brace-style": ["error", "1tbs", { allowSingleLine: true }], // enforce one true brace style
      "space-before-blocks": ["error"], // require space before blocks
      "curly": ["error", "multi-line", "consistent"], // require curly braces for multiline control statements

      // Require semicolons
      "semi": ["error", "always"],

      // Make sure that inside try/catch blocks, promises are 'return await'ed
      // (must disable the base rule as it can report incorrect errors)
      "no-return-await": ["off"],

      // Useless diff results
      "no-trailing-spaces": ["error"],

      // Must use foo.bar instead of foo['bar'] if possible
      "dot-notation": ["error"],

      // Are you sure | is not a typo for || ?
      "no-bitwise": ["error"],

      // Don't unnecessarily quote properties
      "quote-props": ["error", "consistent-as-needed"],

      // Cannot shadow names
      "no-shadow": ["off"],

      // No multiple empty lines
      "no-multiple-empty-lines": ["error"],

      ...rules,
    };

    new EslintImportRules(this, props.import);

    if (props.typescript || TypescriptSupport.hasSupport(this)) {
      new EslintTypescriptRules(this, props.typescript);
    }

    if (props.prettier) {
      new EslintPrettierRules(this, {
        ...props.prettier,
        lineWidth: props.prettier.lineWidth ?? props.lineWidth,
        doubleQuotes: props.prettier.doubleQuotes ?? props.doubleQuotes,
      });
    }

    LifeCycle.implement(this);

    let entry: Construct;

    if (props.configFilePath === true) {
      entry = new JsonFile(this, "EslintConfig", { filePath: ".eslintrc.json", fields: {} });
    } else if (props.configFilePath) {
      entry = new JsonFile(this, "EslintConfig", { filePath: props.configFilePath, fields: {} });
    } else {
      entry = new ManifestEntry(this, "EslintConfig", {}, { shallow: true });
    }

    const scriptsEntry = new ManifestEntry(this, "EslintScripts", {});

    LifeCycle.of(this).on(LifeCycleStage.SYNTH, () => {
      const config = {
        root: true,
        env: {
          jest: JestSupport.hasSupport(this),
          node: true,
        },
        parser: this.parser,
        parserOptions: this.parserOptions,
        plugins: Array.from(this.plugins),
        extends: Array.from(this.extends),
        settings: this.settings,
        ignorePatterns: this.ignorePatterns,
        rules: { ...this.rules, ...props.rules },
        overrides: [
          {
            files: [SG_CONFIG_FILE],
            rules: {
              "@typescript-eslint/no-require-imports": "off",
              "import/no-extraneous-dependencies": "off",
            },
          },
        ],
      } as Record<string, unknown>;

      if (props.configFilePath) {
        Fields.of(entry).addShallowFields(config);
      } else {
        Fields.of(entry).addShallowFields({ eslintConfig: config });
      }

      Fields.of(scriptsEntry).addDeepFields({
        scripts: {
          lint: [
            "eslint",
            `--ext ${Array.from(this.fileExtensions)
              .map((ext) => `.${ext}`)
              .join(",")}`,
            project.sourcePath,
          ].join(" "),
        },
      });
    });
  }

  addRules(rules: Record<string, any>) {
    for (const key of Object.keys(rules)) {
      this.rules[key] = rules[key];
    }
  }
}
