import { XConstruct } from "@pdkit/core";

export class EslintExtension extends XConstruct {
  public readonly extension: string;
  constructor(scope: XConstruct, extension: string) {
    super(scope, `EslintExtension-${extension}`);

    this.extension = extension;
  }
}
