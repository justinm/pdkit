import { PostInstallScript, XConstruct } from "../../../core/src";

export class UpdatePackageVersionsPostInstallScript extends PostInstallScript {
  constructor(scope: XConstruct, id: string, commands: string[]) {
    super(scope, id, commands);
  }
}
