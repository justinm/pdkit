import { Construct } from "constructs";
import request from "sync-request";
import { File } from "../../L1";
import { ManifestEntry } from "./ManifestEntry";

// TODO extend based on https://github.com/github/choosealicense.com/tree/gh-pages/_licenses
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

export class License extends ManifestEntry {
  public static readonly ID = "License";

  readonly license: ValidLicense;

  constructor(scope: Construct, license: ValidLicense, propagate?: boolean) {
    super(scope, License.ID, { license: license }, { propagate });

    this.license = license;

    new File(this, "Default", { filePath: "LICENSE", content: this.content });
  }

  get content() {
    // TODO this is a terrible way to retrieve licenses...
    const licenseData = request(
      "GET",
      `https://raw.githubusercontent.com/github/choosealicense.com/gh-pages/_licenses/${this.license.toLowerCase()}.txt`
    );

    const license = licenseData.body.toString("utf8");

    return license.substring(license.indexOf("---", 4) + 3);
  }
}
