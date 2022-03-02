import { XConstruct } from "@pdkit/core";
import { GithubWorkflow } from "./GithubWorkflow";

export class GithubEnvironmentVariable extends XConstruct {
  readonly key: string;
  readonly value: string;

  constructor(scope: XConstruct, id: string, key: string, value: string) {
    super(scope, id);

    this.key = key;
    this.value = value;
  }

  _onBeforeSynth() {
    GithubWorkflow.of(this)?.addFields({ env: this.content });
  }

  get content() {
    return { [this.key]: this.value };
  }
}
