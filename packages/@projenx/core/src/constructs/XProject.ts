import { Construct } from "constructs";
import { IXConstruct, XConstruct } from "./XConstruct";
import { XSynthesizer } from "../synthesizers/XSynthesizer";

export interface IXProject extends IXConstruct {
  _synthesize(): void;
}

export abstract class XProject extends Construct implements IXProject {
  public static is(construct: any) {
    return construct instanceof this;
  }

  public static of(construct: any) {
    if (!(construct instanceof Construct)) {
      throw new Error(`${construct} is not a construct`);
    }

    const project = (construct as Construct).node.scopes.find((scope) => scope instanceof XProject);

    if (!project) {
      throw new Error(`${construct} must be a child of a project`);
    }

    return project;
  }

  _synthesize() {
    const synthesizers = this.node.children.filter((c) => XSynthesizer.is(c)).map((c) => c as XSynthesizer);
    const constructs = this.node.children.filter((c) => XConstruct.is(c)).map((c) => c as XConstruct);

    if (!constructs.length) {
      throw new Error("No project constructs were found");
    }

    if (!synthesizers.length) {
      throw new Error("No project synthesizers were found");
    }

    for (const construct of constructs) {
      let handled = false;

      const errors = construct.node.validate();

      if (errors.length) {
        throw new Error("Construct did not validate: " + errors[0]);
      }

      for (const synthesizer of synthesizers) {
        if (synthesizer._willHandleConstruct(construct)) {
          const results = synthesizer._synthesize(construct);

          console.log("Synthesizer Results:", results);
          handled = true;
          break;
        }
      }

      if (!handled && (handled as any)._synthesize) {
        throw new Error(`Construct at path ${construct.node.path} was not synthesized`);
      }
    }

    for (const synthesizer of synthesizers) {
      synthesizer._finalize();
    }
  }
}
