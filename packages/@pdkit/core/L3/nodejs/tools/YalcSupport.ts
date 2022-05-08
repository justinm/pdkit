import { Construct } from "constructs";
import { Bindings, Project } from "../../../L1";
import { ManifestEntry } from "../../../L2";

export class YalcSupport extends Construct {
  public static readonly ID = "YalcSupport";

  public static hasSupport(construct: Construct) {
    return !!this.tryOf(construct);
  }

  public static of(construct: Construct) {
    const ret = this.tryOf(construct);

    if (!ret) {
      throw new Error(`Construct ${construct} does not have SemanticReleaseSupport`);
    }

    return ret;
  }

  public static tryOf(construct: Construct) {
    return Bindings.of(Project.of(construct)).findByClass<YalcSupport>(YalcSupport);
  }

  constructor(scope: Construct) {
    super(scope, YalcSupport.ID);

    Bindings.of(Project.of(this)).bind(this);

    new ManifestEntry(this, "Yalc", {
      scripts: {
        yalc: "npx yalc publish",
      },
    });
  }
}
