import { Construct } from "constructs";
import { XFile } from "./xconstructs/XFile";
import request from "sync-request";

export type ValidLicense =
  | "AGPL-3.0"
  | "Apache-2.0"
  | "BSD-2-Clause"
  | "BSD-3-Clause"
  | "BSL-1.0"
  | "CC0-1.0"
  | "EPL-2.0"
  | "GPL-2.0"
  | "GPL-3.0"
  | "LGPL-2.1"
  | "MIT"
  | "MPL-2.0"
  | "Unlicense";

export class License extends XFile {
  readonly license: ValidLicense;

  constructor(scope: Construct, id: string, license: ValidLicense) {
    super(scope, id, "LICENSE.md");

    this.license = license;
  }

  get content() {
    const licenseData = request("GET", "https://api.github.com/licenses/" + this.license);

    return licenseData.body.toString("utf8");
  }
}
