import { Construct } from "constructs";
import { IXConstruct, XConstruct } from "./XConstruct";
import { XSynthesizer } from "../synthesizers/XSynthesizer";
import { NodePackageManager } from "../../../nodejs/src/constructs/NodePackageManager";
import { Workspace } from "../Workspace";
import { XSynthesizableConstruct } from "./XSynthesizableConstruct";
import path from "path";

export interface IXProject extends IXConstruct {
  readonly sourcePath: string;
  _synthesize(): void;
}

export interface XProjectProps {
  readonly sourcePath?: string;
}

export abstract class XProject extends XSynthesizableConstruct implements IXProject {
  readonly _sourcePath?: string;

  constructor(scope: Workspace, id: string, props?: XProjectProps) {
    super(scope, id);

    this._sourcePath = props?.sourcePath;

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];
        const hasParentProject = !!this.node.scopes.reverse().find((s) => s instanceof XProject);
        const hasPackageManager = !!this.node.children.find((c) => c instanceof NodePackageManager);

        if (!hasParentProject && !this._sourcePath) {
          errors.push("Nested projected must explicitly define a sourcePath");
        }

        if (!hasPackageManager) {
          errors.push("The root project must contain a package manager");
        }

        return errors;
      },
    });
  }

  get sourcePath(): string {
    const parent = this.node.scopes.find((scope) => scope !== this && scope instanceof XProject) as
      | XProject
      | undefined;

    return path.join(parent ? parent.sourcePath : "/", this._sourcePath ?? "");
  }

  public static is(construct: any) {
    return construct instanceof this;
  }

  public static of(construct: any): XProject {
    if (!(construct instanceof Construct)) {
      throw new Error(`${construct} is not a construct`);
    }

    const project = (construct as Construct).node.scopes.find(
      (scope) => scope !== construct && scope instanceof XProject
    );

    if (!project) {
      throw new Error(`${construct} must be a child of a project`);
    }

    return project as XProject;
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
