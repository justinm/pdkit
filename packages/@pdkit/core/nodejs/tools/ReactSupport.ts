import path from "path";
import { Construct } from "constructs";
import { GitIgnore, ManifestEntry, Project, XConstruct } from "../../core";
import { NpmIgnore, PackageDependency, PackageDependencyType } from "../constructs";
import { EslintSupport } from "./EslintSupport";
import { JestSupport } from "./JestSupport";
import { TypeScriptJsxMode, TypescriptSupport } from "./TypescriptSupport";

export interface ReactSupportProps {
  readonly enzyme?: boolean;
  readonly testingLibrary?: boolean;
  readonly rewire?: boolean;
  readonly craco?: boolean;
}

export class ReactSupport extends XConstruct {
  public static readonly ID = "ReactSupport";

  public static hasSupport(construct: Construct) {
    return !!this.tryOf(construct);
  }

  public static of(construct: Construct) {
    return Project.of(construct).findDeepChild(ReactSupport);
  }

  public static tryOf(construct: Construct) {
    return Project.of(construct).tryFindDeepChild(ReactSupport);
  }

  constructor(scope: XConstruct, props?: ReactSupportProps) {
    super(scope, ReactSupport.ID);

    const typescriptSupport = TypescriptSupport.tryOf(this);
    const project = Project.of(this);

    new PackageDependency(this, "react");
    new PackageDependency(this, "react-dom");
    new PackageDependency(this, "react-scripts", { type: PackageDependencyType.DEV });

    if (typescriptSupport) {
      new PackageDependency(this, "@types/react", {
        type: PackageDependencyType.DEV,
      });
      new PackageDependency(this, "@types/react-dom", {
        type: PackageDependencyType.DEV,
      });
    }

    if (props?.enzyme) {
      new PackageDependency(this, "@wojtekmaj/enzyme-adapter-react-17", {
        type: PackageDependencyType.DEV,
      });
      new PackageDependency(this, "enzyme", {
        type: PackageDependencyType.DEV,
      });

      if (typescriptSupport) {
        new PackageDependency(this, "@types/enzyme", {
          type: PackageDependencyType.DEV,
        });
      }
    }

    if (props?.testingLibrary) {
      new PackageDependency(this, "@testing-library/jest-dom", {
        type: PackageDependencyType.DEV,
      });
      new PackageDependency(this, "@testing-library/react", {
        type: PackageDependencyType.DEV,
      });
      new PackageDependency(this, "@testing-library/user-event", {
        type: PackageDependencyType.DEV,
      });
    }

    if (EslintSupport.hasSupport(this)) {
      new ManifestEntry(this, "ReactEslintExtension", {
        eslintConfig: {
          extends: ["react-app", "react-app/jest"],
        },
      });
    }
    typescriptSupport?.file.addDeepFields({
      include: [path.join(project.sourcePath, "*.tsx"), path.join(project.sourcePath, "**/*.tsx")],
      compilerOptions: {
        lib: ["dom", "dom.iterable", "esnext"],
        module: "commonjs",
        noEmit: true,
        declaration: false,
        target: "es5",
        jsx: TypeScriptJsxMode.REACT_JSX,
      },
    });
    new GitIgnore(this, ["build/*", "!react-app-env.d.ts", "!setupProxy.js", "!setupTests.js"]);
    new NpmIgnore(this, ["build/*", "!react-app-env.d.ts", "!setupProxy.js", "!setupTests.js"]);

    let reactScriptsCommand = "npx react-scripts";

    if (props?.rewire) {
      new PackageDependency(this, "react-app-rewired", { type: PackageDependencyType.DEV });
      new PackageDependency(this, "customize-cra", { type: PackageDependencyType.DEV });
      new GitIgnore(this, ["!config-overrides.js"]);
      reactScriptsCommand = "npx react-app-rewired";
    }

    if (props?.craco) {
      new PackageDependency(this, "@craco/craco", { type: PackageDependencyType.DEV });
      new GitIgnore(this, ["!craco.config.ts", "!craco.config.js", "!.cracorc.ts", "!.cracorc.js", "!.cracorc"]);
      reactScriptsCommand = "yarn craco";
    }

    new ManifestEntry(this, "ReactScripts", {
      scripts: {
        start: `${reactScriptsCommand} start`,
        build: `${reactScriptsCommand} build`,
        test: `${reactScriptsCommand} test`,
        compile: undefined as any,
      },
      browserslist: {
        production: [">0.2%", "not dead", "not op_mini all"],
        development: ["last 1 chrome version", "last 1 firefox version", "last 1 safari version"],
      },
    });

    if (JestSupport.hasSupport(this)) {
      new ManifestEntry(this, "JestFix", {
        jest: {
          collectCoverage: undefined as any,
          coverageDirectory: undefined as any,
          testPathIgnorePatterns: undefined as any,
          watchIgnorePatterns: undefined as any,
          reporters: undefined as any,
          preset: undefined as any,
        },
      });
    }
  }
}
