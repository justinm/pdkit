import { Construct } from "constructs";

export class Workspace extends Construct {
  constructor(id: string) {
    super(undefined as any, id);
  }

  synthesize() {
    const constructs = this.node.children.filter((c) => (c as any)._synthesize);

    for (const construct of constructs) {
      const errors = construct.node.validate();

      if (errors.length) {
        throw new Error("Construct did not validate: " + errors[0]);
      }

      (construct as any)._synthesize();
    }
  }
}
