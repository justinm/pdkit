import path from "path";
import { ConstructError } from "./util/ConstructError";
import { IXConstruct, XConstruct } from "./base/XConstruct";
import { Workspace } from "./Workspace";
import fs from "fs";
import { Script } from "./scripts/Script";

export interface IProject extends IXConstruct {
  readonly projectRelativeSourcePath: string;
  readonly projectPath: string;
  readonly distPath: string;
}

export interface ProjectProps {
  readonly projectPath?: string;
  readonly sourcePath?: string;
  readonly distPath?: string;
}

export abstract class Project extends Script implements IProject {
  private readonly _projectPath?: string;
  private readonly _sourcePath: string;
  private readonly _distPath: string;

  protected constructor(scope: XConstruct, id: string, props?: ProjectProps) {
    super(scope, id);

    this._projectPath = props?.projectPath;
    this._sourcePath = props?.sourcePath ?? "src";
    this._distPath = props?.distPath ?? "dist";

    Workspace.of(this)._bind(this);

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];
        const hasParentProject = !!this.node.scopes.reverse().find((s) => s instanceof Project);

        if (hasParentProject && !this._projectPath) {
          errors.push("Nested projects must explicitly define a projectPath");
        }

        return errors;
      },
    });
  }

  public tryReadFile(filePath: string) {
    const realPath = path.join(this.projectPath, filePath);

    if (fs.existsSync(realPath)) {
      return fs.readFileSync(realPath);
    }

    return null;
  }

  get projectPath(): string {
    const parent = this.node.scopes.reverse().find((scope) => scope !== this && Project.is(scope)) as
      | Project
      | undefined;

    return path.join(parent ? parent.projectPath : "/", this._projectPath ?? "");
  }

  get projectRelativeSourcePath(): string {
    return path.join(this.projectPath, this._sourcePath).substring(1);
  }

  get sourcePath(): string {
    return this._sourcePath;
  }

  get distPath(): string {
    return this._distPath;
  }

  get subprojects(): Project[] {
    return this.node.children.filter((c) => Project.is(c)).map((c) => c as Project);
  }

  public static is(construct: any) {
    return construct instanceof this;
  }

  public static of(construct: any): Project {
    if (!(construct instanceof XConstruct)) {
      throw new Error(`${construct} is not a construct`);
    }

    if (construct instanceof Project) {
      return construct;
    }

    let project = (construct as XConstruct).node.scopes
      .reverse()
      .find((scope) => scope !== construct && scope instanceof Project);

    if (!project) {
      project = Workspace.of(construct).node.defaultChild;

      if (!project) {
        throw new ConstructError(construct, `Construct must be a child of a project or workspace`);
      }
    }

    return project as Project;
  }
}
