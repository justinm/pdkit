import { Construct } from "constructs";
import { Project, Bindings } from "../../../L1";
import { ManifestEntry } from "../../../L2";
import { PackageDependency, PackageDependencyType } from "../constructs";

export interface SemanticReleaseSupportProps {
  branches: string[];
  plugins?: (string | any[])[];
  changelogs?: boolean;
  releaseNotes?: boolean;
  tool: "npm" | "yarn";
  semanticReleaseArgs?: string;
}

export class SemanticReleaseSupport extends Construct {
  public static hasSupport(construct: Construct) {
    return !!this.tryOf(construct);
  }

  public static of(construct: Construct) {
    const ret = this.tryOf(construct);

    if (!ret) {
      throw new Error(`Construct ${construct} does not have SemanticReleaseSupport`);
    }

    return ret;
  }

  public static tryOf(construct: Construct) {
    return Bindings.of(Project.of(construct)).findByClass<SemanticReleaseSupport>(SemanticReleaseSupport);
  }

  constructor(scope: Construct, props: SemanticReleaseSupportProps) {
    const project = Project.of(scope);

    super(project, "SemanticReleaseSupport");

    Bindings.of(Project.of(this)).bind(this);

    new PackageDependency(this, "@qiwi/multi-semantic-release", {
      type: PackageDependencyType.DEV,
      version: "^3.17.1",
    });
    new PackageDependency(this, "@semantic-release/commit-analyzer", {
      type: PackageDependencyType.DEV,
    });
    new PackageDependency(this, "conventional-changelog-conventionalcommits", {
      type: PackageDependencyType.DEV,
    });
    new PackageDependency(this, "@semantic-release/git", {
      type: PackageDependencyType.DEV,
    });
    new PackageDependency(this, "@semantic-release/github", {
      type: PackageDependencyType.DEV,
    });
    new PackageDependency(this, "semantic-release", {
      type: PackageDependencyType.DEV,
      version: "^17.4.6",
    });

    const plugins: any = [];

    if (props?.releaseNotes) {
      new PackageDependency(this, "@semantic-release/release-notes-generator", {
        type: PackageDependencyType.DEV,
      });

      plugins.push("@semantic-release/release-notes-generator");
    }

    if (props?.changelogs) {
      new PackageDependency(this, "@semantic-release/changelog", {
        type: PackageDependencyType.DEV,
      });
      plugins.push([
        "@semantic-release/changelog",
        {
          changeLogFile: "CHANGELOG.md",
        },
      ]);
    }

    if (props.tool === "npm") {
      plugins.push("@semantic-release/npm");
      plugins.push(["@semantic-release/exec", { publishCmd: "npm run stackgen synth" }]);
    }

    if (props.tool === "yarn") {
      new PackageDependency(this, "@semantic-release/exec", {
        type: PackageDependencyType.DEV,
      });

      plugins.push(["@semantic-release/npm", { npmPublish: false }]);
      plugins.push(["@semantic-release/exec", { publishCmd: "yarn npm publish" }]);
      // We resynth the project to ensure package.json updates correctly after release bump
      plugins.push(["@semantic-release/exec", { publishCmd: "YARN_ENABLE_IMMUTABLE_INSTALLS=false yarn run -T stackgen synth" }]);
    }

    new ManifestEntry(this, "SemanticRelease", {
      resolutions: {
        npm: "^6",
      },
      scripts: {
        release: `npx multi-semantic-release ${props.semanticReleaseArgs ?? ""}`.trim(),
      },
      release: {
        branches: props.branches,
        plugins: props.plugins ?? [
          [
            "@semantic-release/commit-analyzer",
            {
              preset: "conventionalcommits",
              parserOpts: {
                noteKeywords: ["BREAKS", "BREAKING CHANGE", "BREAKING CHANGES", "BACKWARDS COMPAT", "BACKWARDS COMPATIBILITY"],
              },
            },
          ],
          ...plugins,
          [
            "@semantic-release/git",
            {
              message: "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}",
            },
          ],
        ],
      },
    });
  }
}
