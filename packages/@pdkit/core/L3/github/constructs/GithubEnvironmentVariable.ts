import { Construct } from "constructs";
import { Fields, LifeCycle, LifeCycleStage } from "../../../L1";
import { GithubWorkflow } from "./GithubWorkflow";

export class GithubEnvironmentVariable extends Construct {
  readonly key: string;
  readonly value: string;

  constructor(scope: Construct, id: string, key: string, value: string) {
    super(scope, id);

    this.key = key;
    this.value = value;

    LifeCycle.of(this).on(LifeCycleStage.BEFORE_SYNTH, () => {
      Fields.of(GithubWorkflow.of(this)).addDeepFields({ env: this.content });
    });
  }

  get content() {
    return { [this.key]: this.value };
  }
}
