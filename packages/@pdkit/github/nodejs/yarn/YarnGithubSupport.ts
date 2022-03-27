import { Workspace } from "@pdkit/core";
import { GithubSupport, GithubSupportProps } from "../../constructs/GithubSupport";
import { BuildJobProps } from "../../github/jobs/BuildJob";
import { ReleaseJobProps } from "../../github/jobs/ReleaseJob";
import { NpmReleaseStep } from "../npm/steps/NpmReleaseStep";
import { YarnBuildStep } from "./steps/YarnBuildStep";
import { YarnInstallStep } from "./steps/YarnInstallStep";

export interface YarnGithubSupportProps extends Omit<GithubSupportProps, "workflows"> {
  readonly workflows: {
    readonly build: {
      readonly enabled: boolean;
    } & Omit<BuildJobProps, "installStep" | "buildStep" | "codeCoverageStep" | "uploadArtifactStep">;
    readonly release: {
      readonly enabled: boolean;
      readonly branches: string[];
    } & Omit<ReleaseJobProps, "installStep" | "releaseStep">;
  };
}

export class YarnGithubSupport extends GithubSupport {
  public static readonly ID = "GithubSupport";
  constructor(scope: Workspace, props: YarnGithubSupportProps) {
    super(scope, YarnGithubSupport.ID, {
      ...props,
      workflows: {
        ...props.workflows,
        build: {
          ...props.workflows?.build,
          enabled: props.workflows?.build?.enabled ?? false,
          installStep: YarnInstallStep,
          buildStep: YarnBuildStep,
        },
        release: {
          ...props.workflows?.release,
          enabled: props.workflows?.release?.enabled ?? false,
          installStep: YarnInstallStep,
          releaseStep: NpmReleaseStep,
        },
      },
    });
  }
}
