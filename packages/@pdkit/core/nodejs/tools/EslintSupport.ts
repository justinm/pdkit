import { Construct } from "constructs";
import { LifeCycle, ManifestEntry, PDKIT_CONFIG_FILE, Project, XConstruct } from "../../core";
import { PackageDependency, PackageDependencyType } from "../constructs";
import { JestSupport } from "./JestSupport";
import { TypescriptSupport } from "./TypescriptSupport";

export interface EslintProps {
  /**
   * Install Eslint for the project. Defaults to true
   */
  readonly install?: boolean;

  /**
   * Install eslint dependencies (i.e. plugins and configs) for the project. Defaults to true
   */
  readonly installDependencies?: boolean;

  /**
   * Enable Prettier
   */
  readonly prettier?: boolean;

  /**
   * Require double quotes when possible vs single quotes. Defaults to true.
   */
  readonly doubleQuotes?: boolean;

  readonly lineWidth?: number;

  /**
   * Path to `tsconfig.json` which should be used by eslint.
   * @default "./tsconfig.json"
   */
  readonly tsconfigPath?: string;

  /**
   * Patterns with source files that include tests and build tools. These
   * sources are linted but may also import packages from `devDependencies`.
   * @default []
   */
  readonly devSourcePatterns?: string[];

  /**
   * File types that should be linted (e.g. [ "js", "ts" ])
   * @default ["js"]
   */
  readonly fileExtensions?: string[];

  /**
   * List of file patterns that should not be linted, using the same syntax
   * as .gitignore patterns.
   *
   * @default [ '*.js', '*.d.ts', 'node_modules/', '*.generated.ts', 'coverage' ]
   */
  readonly ignorePatterns?: string[];

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

  readonly extraPlugins?: string[];
  readonly extends?: string[];
  readonly rules?: Record<string, unknown>;
}

export class EslintSupport extends XConstruct {
  public static hasSupport(construct: Construct) {
    return !!this.tryOf(construct);
  }

  public static of(construct: Construct) {
    return Project.of(construct).findDeepChild(EslintSupport);
  }

  public static tryOf(construct: Construct) {
    return Project.of(construct).tryFindDeepChild(EslintSupport);
  }

  public readonly rules: Record<string, unknown> = {};
  public readonly plugins: string[] = [];
  public readonly extends: string[] = [];
  public readonly fileExtensions: Set<string>;
  public readonly devSourcePatterns: string[] = [];
  public readonly ignorePatterns: string[] = [];
  public readonly tsconfig: string | undefined;
  readonly aliasMap?: { [key: string]: string };
  readonly aliasExtensions?: string[];
  readonly tsAlwaysTryTypes?: boolean;

  constructor(scope: XConstruct, props: EslintProps) {
    super(scope, "EslintSupport");

    this.devSourcePatterns = props.devSourcePatterns ?? [];
    this.tsconfig = props.tsconfigPath ?? undefined;
    this.plugins = props.extraPlugins ?? [];
    this.extends = props.extends ?? [];
    this.aliasMap = props.aliasMap;
    this.aliasExtensions = props.aliasExtensions;
    this.tsAlwaysTryTypes = props.tsAlwaysTryTypes;
    this.fileExtensions = new Set(props.fileExtensions ?? []);
    this.ignorePatterns = props.ignorePatterns ?? ["*.js", "*.d.ts", "node_modules/", "*.generated.ts", "coverage"];

    const lineWidth = props.lineWidth ?? 80;
    let rules = props.rules ?? {};
    this.extends.push("plugin:import/recommended");
    this.plugins.push("import");

    const project = Project.of(this);
    const hasTsSupport = project.tryFindDeepChildren(TypescriptSupport);

    if (props?.install ?? true) {
      new PackageDependency(this, "eslint", {
        type: PackageDependencyType.DEV,
      });
    }

    if (props?.installDependencies ?? true) {
      new PackageDependency(this, "eslint-import-resolver-node", {
        type: PackageDependencyType.DEV,
      });
      new PackageDependency(this, "eslint-plugin-import", {
        type: PackageDependencyType.DEV,
      });

      if (hasTsSupport) {
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
    }

    this.fileExtensions.add("js");

    if (hasTsSupport) {
      this.fileExtensions.add("ts");
      this.fileExtensions.delete("js");
      this.plugins.push("@typescript-eslint");

      rules = {
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
        ...rules,
      };
    }

    if (props.prettier) {
      new PackageDependency(this, "prettier", {
        type: PackageDependencyType.DEV,
      });
      new PackageDependency(this, "eslint-plugin-prettier", {
        type: PackageDependencyType.DEV,
      });
      new PackageDependency(this, "eslint-config-prettier", {
        type: PackageDependencyType.DEV,
      });
      this.plugins.push("prettier");
      this.extends.push("prettier");

      rules = {
        "prettier/prettier": [
          "error",
          {
            singleQuote: !(props.doubleQuotes ?? true),
            quoteProps: "consistent",
          },
        ],
        ...rules,
      };
    } else {
      rules = {
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
    }

    this.rules = {
      // Require all imported dependencies are actually declared in package.json
      "import/no-extraneous-dependencies": [
        "error",
        {
          // Only allow importing devDependencies from "devdirs".
          devDependencies: Array.from(new Set(this.devSourcePatterns ?? [])),
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
      ...rules,
    };

    this.addLifeCycleScript(LifeCycle.BEFORE_SYNTH, () => {
      const config = {
        env: {
          jest: JestSupport.hasSupport(this),
          node: true,
        },
        root: true,
        plugins: this.plugins,
        extends: this.extends,
        settings: {
          "import/parsers": {
            "@typescript-eslint/parser": [".ts", ".tsx"],
          },
          "import/resolver": {
            ...(this.aliasMap && {
              alias: {
                map: Object.entries(this.aliasMap).map(([k, v]) => [k, v]),
                extensions: this.aliasExtensions,
              },
            }),
            node: {},
            typescript: {
              project: this.tsconfig,
              ...(this.tsAlwaysTryTypes !== false && { alwaysTryTypes: true }),
            },
          },
        },
        ignorePatterns: this.ignorePatterns,
        rules: this.rules,
        overrides: [
          {
            files: [PDKIT_CONFIG_FILE],
            rules: {
              "@typescript-eslint/no-require-imports": "off",
              "import/no-extraneous-dependencies": "off",
            },
          },
        ],
      } as Record<string, unknown>;

      if (hasTsSupport && hasTsSupport.length) {
        config.parser = "@typescript-eslint/parser";

        config.parserOptions = {
          ecmaVersion: 2018,
          sourceType: "module",
          project: `./${hasTsSupport[0].fileName}`,
        };
      }

      new ManifestEntry(this, "EslintConfig", { eslintConfig: config }, { shallow: true });
      new ManifestEntry(this, "EslintManifestScriptEntry", {
        scripts: {
          lint: [
            "eslint",
            `--ext ${Array.from(this.fileExtensions).join(",")}`,
            "--fix",
            "--no-error-on-unmatched-pattern",
            project.sourcePath,
            ...this.devSourcePatterns,
          ].join(" "),
        },
      });
      new ManifestEntry(this, "LintCommand", {
        scripts: {
          lint: `eslint --ext .ts,.tsx --fix --no-error-on-unmatched-pattern ${project.sourcePath}`,
        },
      });
    });
  }
}
