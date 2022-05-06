import { Project } from "../../../core";
import { GithubSupport, GithubSupportProps } from "../../constructs/GithubSupport";
import { BuildWorkflowProps } from "../../github/workflows/BuildWorkflow";
import { ReleaseWorkflowProps } from "../../github/workflows/ReleaseWorkflow";

export interface YarnGithubSupportProps extends Omit<GithubSupportProps, "workflows"> {
  readonly registryUrl?: string;
  readonly workflows: {
    readonly build: {
      readonly enabled: boolean;
    } & Partial<Omit<BuildWorkflowProps, "installStep" | "buildStep" | "codeCoverageStep" | "uploadArtifactStep">>;
    readonly release: {
      readonly enabled: boolean;
      readonly branches: string[];
    } & Partial<Omit<ReleaseWorkflowProps, "installStep" | "releaseStep">>;
  };
}

export class YarnGithubSupport extends GithubSupport {
  public static readonly ID = "GithubSupport";

  constructor(scope: Project, props: YarnGithubSupportProps) {
    super(scope, YarnGithubSupport.ID);

    /*
          workflows: {
        ...props.workflows,
        build: {
          cache: {
            "${{ runner.os }}-yarn": ".yarn/cache",
          },
          ...props.workflows?.build,
          tools: {
            yarn: {
              ...(props.workflows?.build.tools?.yarn ?? {
                version: "14.x",
                cache: "yarn",
                registryUrl: "https://registry.npmjs.org/",
              }),
            },
          },
          enabled: props.workflows?.build?.enabled ?? false,
          installStep: YarnInstallStep,
          buildStep: YarnBuildStep,
        },
        release: {
          ...props.workflows?.release,
          cache: {
            "${{ runner.os }}-yarn-release": ".yarn/cache",
          },
          tools: {
            yarn: {
              ...(props.workflows?.release.tools?.yarn ?? {
                version: "14.x",
                cache: "yarn",
                registryUrl: props.registryUrl,
              }),
            },
          },
          enabled: props.workflows?.release?.enabled ?? false,
          installStep: YarnInstallStep,
          buildStep: YarnBuildStep,
          releaseStep: NpmReleaseStep,
        },
      },
     */
  }
}
