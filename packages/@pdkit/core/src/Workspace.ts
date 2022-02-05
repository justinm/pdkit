import { Construct, IConstruct } from "constructs";
import { ConstructError } from "./util/ConstructError";
import { XConstruct } from "./base/XConstruct";

export interface IWorkspace extends IConstruct {
  readonly rootPath: string;
  synth(): void;
}

export interface WorkspaceProps {
  readonly rootPath?: string;
}

export class Workspace extends XConstruct implements IWorkspace {
  public readonly rootPath: string;

  constructor(id: string, props?: WorkspaceProps) {
    super(undefined as any, id);

    this.rootPath = props?.rootPath ?? process.cwd();

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];

        if (this.node.scopes.length > 0) {
          errors.push("A workspace must be the top-most construct");
        }

        return errors;
      },
    });
  }

  synth() {
    this.node.validate();

    this._beforeSynth();
    this._synth();
  }

  public static of(construct: any) {
    if (!(construct instanceof Construct)) {
      throw new Error(`${construct} is not a construct`);
    }

    const workspace = (construct as Construct).node.scopes[0];

    if (!workspace || !(workspace instanceof Workspace)) {
      throw new ConstructError(construct, `Not a child of a workspace`);
    }

    return workspace as unknown as Workspace;
  }
}