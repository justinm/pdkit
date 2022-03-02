import { ManifestEntry, XConstruct } from "@pdkit/core";
import { PackageDependency, PackageDependencyType } from "../constructs/PackageDependency";
import { JestOptions, JestSupport } from "./JestSupport";

export class JestTypescriptSupport extends JestSupport {
  constructor(scope: XConstruct, id: string, props: JestOptions) {
    super(scope, id, props);

    new PackageDependency(this, "ts-jest", { type: PackageDependencyType.DEV });
    new ManifestEntry(this, "TsJest", { jest: { preset: "ts-jest" } });
  }
}
