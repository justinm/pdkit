import { Workspace } from "@pdkit/core";
import { GithubSupport, GithubSupportProps } from "../../constructs/GithubSupport";
import { NpmBuildStep } from "./steps/NpmBuildStep";
import { NpmInstallStep } from "./steps/NpmInstallStep";

export interface NpmGithubSupportProps extends Omit<GithubSupportProps, "workflows"> {
  readonly workflows?: {
    readonly build?: {
      readonly enabled: boolean;
    };
  };
}

export class NpmGithubSupport extends GithubSupport {
  constructor(scope: Workspace, id: string, props: NpmGithubSupportProps) {
    super(scope, id, {
      ...props,
      workflows: {
        build: {
          enabled: props.workflows?.build?.enabled ?? false,
          installStep: NpmInstallStep,
          buildStep: NpmBuildStep,
        },
      },
    });
  }
}
