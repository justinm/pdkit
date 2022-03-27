import { XConstruct } from "@pdkit/core";
import { GithubJob, GithubJobProps, JobPermission, Tools } from "../../constructs/GithubJob";
import { GithubJobStep } from "../../constructs/GithubJobStep";

export interface SetupToolsProps extends Partial<GithubJobProps> {
  readonly job?: GithubJobProps;
  readonly tools: Tools;
}

export class SetupTools extends GithubJob {
  constructor(scope: XConstruct, id: string, props: SetupToolsProps) {
    super(scope, id, {
      name: "SetupNode",
      permissions: {
        contents: JobPermission.WRITE,
      },
      runsOn: ["ubuntu-latest"],
      ...props?.job,
    });

    const { tools } = props;

    if (tools.java) {
      new GithubJobStep(this, "SetupJava", {
        uses: "actions/setup-java@v2",
        with: { distribution: "temurin", "java-version": tools.java.version },
      });
    }

    if (tools.node) {
      new GithubJobStep(this, "SetupNode", {
        uses: "actions/setup-node@v2",
        with: { "node-version": tools.node.version, cache: tools.node.cache },
      });
    }
    if (tools.python) {
      new GithubJobStep(this, "SetupPython", {
        uses: "actions/setup-python@v2",
        with: { "python-version": tools.python.version },
      });
    }

    if (tools.go) {
      new GithubJobStep(this, "SetupGo", {
        uses: "actions/setup-go@v2",
        with: { "go-version": tools.go.version },
      });
    }

    if (tools.dotnet) {
      new GithubJobStep(this, "SetupDotNet", {
        uses: "actions/setup-dotnet@v1",
        with: { "dotnet-version": tools.dotnet.version },
      });
    }
  }
}
