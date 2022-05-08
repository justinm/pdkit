import { Construct } from "constructs";
import { GithubJobProps, Tools, GithubStep } from "../../L1";

export interface SetupToolsProps extends Partial<GithubJobProps> {
  readonly job?: GithubJobProps;
  readonly tools: Tools;
}

export class SetupTools extends Construct {
  constructor(scope: Construct, id: string, props: SetupToolsProps) {
    super(scope, id);

    const { tools } = props;

    if (tools.java) {
      new GithubStep(this, "SetupJava", {
        uses: "actions/setup-java@v2",
        with: { "distribution": "temurin", "java-version": tools.java.version },
        priority: props.priority,
      });
    }

    if (tools.node) {
      const { registryUrl, version, ...other } = tools.node;
      new GithubStep(this, "SetupNode", {
        uses: "actions/setup-node@v2",
        with: { "node-version": version, "registry-url": registryUrl, ...other },
        priority: props.priority,
      });
    }

    if (tools.yarn) {
      const { npmAuthToken, registryUrl, version, ...other } = tools.yarn;

      new GithubStep(this, "SetupNode", {
        uses: "actions/setup-node@v2",
        with: { "node-version": version, "registry-url": registryUrl, ...other },
        priority: props.priority,
      });

      new GithubStep(this, "YarnAuth", {
        run: `yarn config set --home npmAuthToken ${npmAuthToken ?? "${{ secrets.NPM_TOKEN }}"}`,
        priority: props.priority,
      });
    }

    if (tools.python) {
      new GithubStep(this, "SetupPython", {
        uses: "actions/setup-python@v2",
        with: { "python-version": tools.python.version },
        priority: props.priority,
      });
    }

    if (tools.go) {
      new GithubStep(this, "SetupGo", {
        uses: "actions/setup-go@v2",
        with: { "go-version": tools.go.version },
        priority: props.priority,
      });
    }

    if (tools.dotnet) {
      new GithubStep(this, "SetupDotNet", {
        uses: "actions/setup-dotnet@v1",
        with: { "dotnet-version": tools.dotnet.version },
        priority: props.priority,
      });
    }
  }
}
