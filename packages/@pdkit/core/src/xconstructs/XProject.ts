import { Construct } from "constructs";
import { IXConstruct, XConstruct } from "./XConstruct";
import { XSynthesizer } from "../synthesizers/XSynthesizer";
import { NodePackageManager } from "../../../nodejs/src/xconstructs/NodePackageManager";
import { Workspace } from "../Workspace";
import { XSynthesizableConstruct } from "./XSynthesizableConstruct";
import path from "path";
import { Author } from "../../../nodejs/src/xconstructs/Author";
import { ConstructError } from "../util/ConstructError";
import { GitIgnore } from "../GitIgnore";

export interface IXProject extends IXConstruct {
  readonly sourcePath: string;
  readonly projectPath: string;
  readonly synthesizers: XSynthesizer[];
  _onSynth(): void;
  _synth(): void;
}

export interface XProjectProps {
  readonly projectPath?: string;
  readonly sourcePath?: string;
  readonly authorName?: string;
  readonly authorEmail?: string;
  readonly authorOrganization?: boolean;
  readonly authorUrl?: string;
  readonly gitignore?: string[];
}

export abstract class XProject extends XSynthesizableConstruct implements IXProject {
  readonly gitignore: GitIgnore;
  readonly _projectPath?: string;
  readonly _sourcePath: string;

  constructor(scope: Workspace | XProject, id: string, props?: XProjectProps) {
    super(scope, id);

    this._projectPath = props?.projectPath;
    this._sourcePath = props?.sourcePath ?? "src";

    if (props?.authorName || props?.authorEmail || props?.authorUrl || props?.authorOrganization) {
      new Author(this, "Author", {
        email: props.authorEmail,
        name: props.authorName,
        url: props.authorUrl,
        organization: props.authorOrganization,
      });
    }

    this.gitignore = new GitIgnore(this, "StandardIgnore", props?.gitignore ?? []);

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];
        const hasParentProject = !!this.node.scopes.reverse().find((s) => s instanceof XProject);
        const hasPackageManager = !!this.node.children.find((c) => c instanceof NodePackageManager);

        if (hasParentProject && !this._projectPath) {
          errors.push("Nested projected must explicitly define a sourcePath");
        }

        if (!hasPackageManager) {
          errors.push("The root project must contain a package manager");
        }

        return errors;
      },
    });
  }

  get projectPath(): string {
    const parent = this.node.scopes.reverse().find((scope) => scope !== this && XProject.is(scope)) as
      | XProject
      | undefined;

    return path.join(parent ? parent.projectPath : "/", this._projectPath ?? "");
  }

  get sourcePath(): string {
    return path.join(this.projectPath, this._sourcePath);
  }

  public static is(construct: any) {
    return construct instanceof this;
  }

  public static of(construct: any): XProject {
    if (!(construct instanceof Construct)) {
      throw new Error(`${construct} is not a construct`);
    }

    const project = (construct as Construct).node.scopes
      .reverse()
      .find((scope) => scope !== construct && scope instanceof XProject);

    if (!project) {
      throw new ConstructError(construct, `Construct must be a child of a project`);
    }

    return project as XProject;
  }

  get subprojects(): XProject[] {
    return this.node.children.filter((c) => XProject.is(c)).map((c) => c as XProject);
  }

  get synthesizers(): XSynthesizer[] {
    const localSynthesizers = this.node.children.filter((c) => XSynthesizer.is(c)).map((c) => c as XSynthesizer);
    const parentProject = this.node.scopes
      .reverse()
      .find((scope) => scope !== this && scope instanceof XProject) as XProject;

    return [localSynthesizers, parentProject ? parentProject.synthesizers : []].flat();
  }

  _synth() {
    const synthesizers = this.synthesizers;
    const constructs = this.node.children.filter((c) => XConstruct.is(c)).map((c) => c as XConstruct);

    if (!constructs.length) {
      throw new ConstructError(this, "No constructs were found in the project");
    }

    if (!synthesizers.length) {
      throw new ConstructError(this, "No synthesizers were found for the project");
    }

    this._onSynth();

    for (const construct of constructs) {
      let handled = false;

      const errors = construct.node.validate();

      if (errors.length) {
        throw new ConstructError(construct, "Construct did not validate: " + errors[0]);
      }

      for (const synthesizer of synthesizers) {
        if (synthesizer._willHandleConstruct(construct)) {
          synthesizer._synthesize(construct);

          handled = true;
          break;
        }
      }

      if (XProject.is(construct)) {
        (construct as XProject)._synth();
      }

      if (!handled && (handled as any)._synthesize) {
        throw new ConstructError(construct, `Construct was not synthesized`);
      }
    }

    for (const synthesizer of synthesizers) {
      synthesizer._finalize();
    }
  }

  _onSynth() {}
}
