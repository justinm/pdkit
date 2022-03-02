import fs from "fs";
import path from "path";
import { IXConstruct, XConstruct } from "../base/XConstruct";
import { ConstructError } from "../util/ConstructError";
import { Workspace } from "./Workspace";

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

type Constructor<T> = abstract new (...args: any[]) => any;

export abstract class Project extends XConstruct implements IProject {
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

  private readonly _projectPath?: string;
  private readonly _sourcePath: string;
  private readonly _distPath: string;

  protected constructor(scope: XConstruct, id: string, props?: ProjectProps) {
    super(scope, id);

    this._projectPath = props?.projectPath;
    this._sourcePath = props?.sourcePath ?? ".";
    this._distPath = props?.distPath ?? ".";

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

  public tryReadJsonFile<T = Record<string, unknown>>(filePath: string): T | undefined {
    const data = this.tryReadFile(filePath) as Buffer;

    if (data) {
      return JSON.parse(data.toString("utf8")) as T;
    } else {
      return undefined;
    }
  }

  public tryFindDeepChildren<
    T extends Constructor<any> = Constructor<any>,
    TRet extends InstanceType<T> = InstanceType<T>
  >(childType: T): TRet[] {
    const parentProject = Project.of(this);

    return this.node
      .findAll()
      .filter((c) => c instanceof childType)
      .filter((c) => Project.of(c) === parentProject) as TRet[];
  }

  get parentProject() {
    return Project.of(this);
  }

  get siblings() {
    return Project.of(this);
  }

  get projectPath(): string {
    const parent = this.node.scopes.reverse().find((scope) => scope !== this && Project.is(scope)) as
      | Project
      | undefined;

    return path.join(parent ? parent.projectPath : "/", this._projectPath ?? "");
  }

  get absolutePath(): string {
    const workspace = Workspace.of(this);

    const parent = this.node.scopes.reverse().find((scope) => scope !== this && Project.is(scope)) as
      | Project
      | undefined;

    return path.join(workspace.rootPath, parent ? parent.projectPath : "/", this._projectPath ?? "");
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
}
