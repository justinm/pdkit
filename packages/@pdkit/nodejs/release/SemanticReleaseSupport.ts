import { ManifestEntry, Project, XConstruct } from "@pdkit/core";
import { PackageDependency, PackageDependencyType } from "../constructs";

export interface SemanticReleaseSupportProps {
  branches: string[];
  plugins?: (string | any[])[];
  changelogs?: boolean;
  releaseNotes?: boolean;
}

export class SemanticReleaseSupport extends XConstruct {
  constructor(scope: XConstruct, props: SemanticReleaseSupportProps) {
    const project = Project.of(scope);

    super(project, "SemanticReleaseSupport");

    new PackageDependency(this, "@qiwi/multi-semantic-release", {
      type: PackageDependencyType.DEV,
      version: "^3.17.1",
    });
    new PackageDependency(this, "@semantic-release/commit-analyzer", {
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

    new ManifestEntry(this, "SemanticRelease", {
      scripts: {
        release: "npx multi-semantic-release --deps.bump=override",
      },
      release: {
        branches: props.branches,
        plugins: props.plugins ?? [
          [
            "@semantic-release/commit-analyzer",
            {
              preset: "conventionalcommits",
              parserOpts: {
                noteKeywords: [
                  "BREAKS",
                  "BREAKING CHANGE",
                  "BREAKING CHANGES",
                  "BACKWARDS COMPAT",
                  "BACKWARDS COMPATIBILITY",
                ],
              },
            },
          ],
          ...plugins,
          "@semantic-release/npm",
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
