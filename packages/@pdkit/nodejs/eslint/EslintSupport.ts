import { LifeCycle, ManifestEntry, PDKIT_CONFIG_FILE, Project, XConstruct } from "@pdkit/core";
import { PackageDependency, PackageDependencyType, TypescriptSupport } from "../constructs";
import { EslintExtension } from "./EslintExtension";

export interface EslintProps {
  /**
   * Enable Prettier support
   */
  readonly prettier?: boolean;

  /**
   * Path to `tsconfig.json` which should be used by eslint.
   * @default "./tsconfig.json"
   */
  readonly tsconfigPath?: string;

  /**
   * Directories with source files that include tests and build tools. These
   * sources are linted but may also import packages from `devDependencies`.
   * @default []
   */
  readonly devdirs?: string[];

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

  readonly plugins?: string[];
  readonly extends?: string[];
}

export class EslintSupport extends XConstruct {
  public rules: Record<string, unknown> = {};
  public readonly plugins: string[] = [];
  public readonly extends: string[] = [];
  public readonly devdirs: string[] = [];
  public readonly ignorePatterns: string[] = [];
  public readonly tsconfig: string | undefined;
  readonly aliasMap?: { [key: string]: string };
  readonly aliasExtensions?: string[];
  readonly tsAlwaysTryTypes?: boolean;

  constructor(scope: XConstruct, props: EslintProps) {
    super(scope, "EslintSupport");

    this.devdirs = props.devdirs ?? [];
    this.tsconfig = props.tsconfigPath ?? undefined;
    this.plugins = props.plugins ?? ["@typescript-eslint", "import"];
    this.extends = props.extends ?? ["plugin:import/typescript"];
    this.aliasMap = props.aliasMap;
    this.aliasExtensions = props.aliasExtensions;
    this.tsAlwaysTryTypes = props.tsAlwaysTryTypes;

    this.ignorePatterns = props.ignorePatterns ?? ["*.js", "*.d.ts", "node_modules/", "*.generated.ts", "coverage"];

    new PackageDependency(this, "eslint", { type: PackageDependencyType.DEV });
    new PackageDependency(this, "@typescript-eslint/eslint-plugin", { type: PackageDependencyType.DEV, version: "^5" });
    new PackageDependency(this, "@typescript-eslint/parser", { type: PackageDependencyType.DEV, version: "^5" });
    new PackageDependency(this, "eslint-import-resolver-node", { type: PackageDependencyType.DEV });
    new PackageDependency(this, "eslint-import-resolver-typescript", { type: PackageDependencyType.DEV });
    new PackageDependency(this, "eslint-plugin-import", { type: PackageDependencyType.DEV });
    new PackageDependency(this, "json-schema", { type: PackageDependencyType.DEV });

    if (props?.aliasMap) {
      new PackageDependency(this, "eslint-import-resolver-alias", { type: PackageDependencyType.DEV });
    }

    if (props.fileExtensions) {
      props.fileExtensions.forEach((ext) => new EslintExtension(this, ext));
    }

    this.rules = {
      // see https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/indent.md
      indent: ["off"],
      "@typescript-eslint/indent": ["error", 2],

      // Style
      quotes: ["error", "single", { avoidEscape: true }],
      "comma-dangle": ["error", "always-multiline"], // ensures clean diffs, see https://medium.com/@nikgraf/why-you-should-enforce-dangling-commas-for-multiline-statements-d034c98e36f8
      "comma-spacing": ["error", { before: false, after: true }], // space after, no space before
      "no-multi-spaces": ["error", { ignoreEOLComments: false }], // no multi spaces
      "array-bracket-spacing": ["error", "never"], // [1, 2, 3]
      "array-bracket-newline": ["error", "consistent"], // enforce consistent line breaks between brackets
      "object-curly-spacing": ["error", "always"], // { key: 'value' }
      "object-curly-newline": ["error", { multiline: true, consistent: true }], // enforce consistent line breaks between braces
      "object-property-newline": ["error", { allowAllPropertiesOnSameLine: true }], // enforce "same line" or "multiple line" on object properties
      "keyword-spacing": ["error"], // require a space before & after keywords
      "brace-style": ["error", "1tbs", { allowSingleLine: true }], // enforce one true brace style
      "space-before-blocks": ["error"], // require space before blocks
      curly: ["error", "multi-line", "consistent"], // require curly braces for multiline control statements
      "@typescript-eslint/member-delimiter-style": ["error"],

      // Require semicolons
      semi: ["error", "always"],

      // Max line lengths
      "max-len": [
        "error",
        {
          code: 150,
          ignoreUrls: true, // Most common reason to disable it
          ignoreStrings: true, // These are not fantastic but necessary for error messages
          ignoreTemplateLiterals: true,
          ignoreComments: true,
          ignoreRegExpLiterals: true,
        },
      ],

      // Don't unnecessarily quote properties
      "quote-props": ["error", "consistent-as-needed"],
    };

    if (props.prettier) {
      new PackageDependency(this, "prettier", { type: PackageDependencyType.DEV });
      new PackageDependency(this, "eslint-plugin-prettier", { type: PackageDependencyType.DEV });
      new PackageDependency(this, "eslint-config-prettier", { type: PackageDependencyType.DEV });

      this.rules = {
        "prettier/prettier": ["error"],
      };

      this.plugins.push("prettier");
      this.extends.push("prettier", "plugin:prettier/recommended");
    }

    this.addLifeCycleScript(LifeCycle.BEFORE_SYNTH, () => {
      const standardRules = {
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

        // Require all imported dependencies are actually declared in package.json
        "import/no-extraneous-dependencies": [
          "error",
          {
            // Only allow importing devDependencies from "devdirs".
            devDependencies: Array.from(new Set((this.devdirs ?? []).map((dir) => `**/${dir}/**`))),
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

        // Cannot import from the same module twice
        "no-duplicate-imports": ["error"],

        // Cannot shadow names
        "no-shadow": ["off"],

        // Required spacing in property declarations (copied from TSLint, defaults are good)
        "key-spacing": ["error"],

        // No multiple empty lines
        "no-multiple-empty-lines": ["error"],

        // Make sure that inside try/catch blocks, promises are 'return await'ed
        // (must disable the base rule as it can report incorrect errors)
        "no-return-await": ["off"],

        // Useless diff results
        "no-trailing-spaces": ["error"],

        // Must use foo.bar instead of foo['bar'] if possible
        "dot-notation": ["error"],

        // Are you sure | is not a typo for || ?
        "no-bitwise": ["error"],
      };

      const config = {
        env: {
          jest: true,
          node: true,
        },
        root: true,
        parser: "@typescript-eslint/parser",
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
        rules: { ...this.rules, ...standardRules },
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

      const project = Project.of(this);
      const tsSupport = project.tryFindDeepChildren(TypescriptSupport);

      if (tsSupport && tsSupport.length) {
        new EslintExtension(this, "ts");

        config.parserOptions = {
          ecmaVersion: 2018,
          sourceType: "module",
          project: tsSupport[0].fileName,
        };
      } else {
        new EslintExtension(this, "js");
      }

      const fileExtensions = project.tryFindDeepChildren(EslintExtension).map((e) => `.${e.extension}`);
      new ManifestEntry(this, "EslintManifestScriptEntry", {
        scripts: {
          lint: [
            "eslint",
            `--ext ${fileExtensions.join(",")}`,
            "--fix",
            "--no-error-on-unmatched-pattern",
            project.sourcePath,
            ...this.devdirs,
          ].join(" "),
        },
      });
      new ManifestEntry(this, "EslintConfig", { eslintConfig: config }, { shallow: true });
    });
  }
}
