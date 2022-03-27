import { ManifestEntry, XConstruct } from "@pdkit/core";
import { PackageDependency, PackageDependencyType } from "../constructs";
import { JestProps, JestSupport } from "./JestSupport";

export class JestTypescriptSupport extends JestSupport {
  constructor(scope: XConstruct, props: JestProps) {
    super(scope, props);

    new PackageDependency(this, "ts-jest", { type: PackageDependencyType.DEV });
    new ManifestEntry(this, "TsJest", { jest: { preset: "ts-jest" } });
  }
}
