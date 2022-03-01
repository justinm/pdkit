import { Workspace } from "@pdkit/core/src";
import { GithubSupport, GithubSupportProps } from "../../constructs/GithubSupport";
import { BuildJobProps } from "../../github/jobs/BuildJob";
import { YarnBuildStep } from "./steps/YarnBuildStep";
import { YarnInstallStep } from "./steps/YarnInstallStep";

export interface YarnGithubSupportProps extends Omit<GithubSupportProps, "workflows"> {
  readonly workflows: {
    readonly build: {
      readonly enabled: boolean;
    } & Omit<BuildJobProps, "installStep" | "buildStep" | "codeCoverageStep" | "uploadArtifactStep">;
  };
}

export class YarnGithubSupport extends GithubSupport {
  constructor(scope: Workspace, id: string, props: YarnGithubSupportProps) {
    super(scope, id, {
      ...props,
      workflows: {
        ...props.workflows,
        build: {
          ...props.workflows?.build,
          enabled: props.workflows?.build?.enabled ?? false,
          installStep: YarnInstallStep,
          buildStep: YarnBuildStep,
        },
      },
    });
  }
}
