import { Construct } from "constructs";

export interface WorkspaceProps {
  readonly rootPath: string;
}

export class Workspace extends Construct {
  public readonly rootPath: string;
  constructor(id: string, props?: WorkspaceProps) {
    super(undefined as any, id);

    this.rootPath = props?.rootPath ?? process.cwd();
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

  public static of(construct: any) {
    if (!(construct instanceof Construct)) {
      throw new Error(`${construct} is not a construct`);
    }

    const workspace = (construct as Construct).node.scopes.find(
      (scope) => scope !== construct && scope instanceof Workspace
    );

    if (!workspace) {
      throw new Error(`${construct} must be a child of a project`);
    }

    return workspace as Workspace;
  }
}
