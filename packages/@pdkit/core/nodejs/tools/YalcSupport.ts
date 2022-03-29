import { Construct } from "constructs";
import { ManifestEntry, Project, XConstruct } from "../../core";

export class YalcSupport extends XConstruct {
  public static readonly ID = "YalcSupport";

  public static hasSupport(construct: Construct) {
    return !!this.tryOf(construct);
  }

  public static of(construct: Construct) {
    return Project.of(construct).findDeepChild(YalcSupport);
  }

  public static tryOf(construct: Construct) {
    return Project.of(construct).tryFindDeepChild(YalcSupport);
  }

  constructor(scope: XConstruct) {
    super(scope, YalcSupport.ID);

    new ManifestEntry(this, "Yalc", {
      scripts: {
        yalc: "npx yalc publish",
      },
    });
  }
}
