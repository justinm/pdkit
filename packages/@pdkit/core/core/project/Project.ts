import path from "path";
import { IXConstruct, XConstruct } from "../base/XConstruct";
import { Workspace } from "./Workspace";

export interface IProject extends IXConstruct {
  readonly projectRelativeSourcePath: string;
  readonly projectPath: string;
  readonly sourcePath: string;
  readonly distPath: string;
  readonly parentProject: IProject;
  readonly projects: IProject[];

  tryFindDeepChildren<T extends Constructor<any> = Constructor<any>, TRet extends InstanceType<T> = InstanceType<T>>(
    childType: T
  ): TRet[];

  tryFindDeepChild<T extends Constructor<any> = Constructor<any>, TRet extends InstanceType<T> = InstanceType<T>>(
    childType: T
  ): TRet | undefined;

  findDeepChild<T extends Constructor<any> = Constructor<any>, TRet extends InstanceType<T> = InstanceType<T>>(
    childType: T
  ): TRet;
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
    const project = this.tryOf(construct);

    if (!project) {
      throw new Error(`Construct ${construct} must be a child of a project or workspace`);
    }

    return project;
  }
  public static tryOf(construct: any): Project | undefined {
    if (!(construct instanceof XConstruct)) {
      throw new Error(`${construct.constructor.name} is not a construct`);
    }

    if (construct instanceof Project) {
      return construct;
    }

    let project = (construct as XConstruct).node.scopes
      .reverse()
      .find((scope) => scope !== construct && scope instanceof Project);

    if (!project) {
      const workspace = Workspace.of(construct);

      if (workspace) {
        const defaultProject = workspace.node.defaultChild;

        if (defaultProject) {
          return defaultProject as Project;
        }
      }

      return undefined;
    }

    return project as Project;
  }

  private readonly _projectPath?: string;
  private readonly _sourcePath: string;
  private readonly _distPath: string;

  constructor(scope: XConstruct, id: string, props?: ProjectProps) {
    super(scope, id);

    this._projectPath = props?.projectPath;
    this._sourcePath = props?.sourcePath ?? "src";
    this._distPath = props?.distPath ?? "dist";

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];
        const parentProject = Project.of(this);

        if (!parentProject && !this._projectPath) {
          errors.push("Nested projects must explicitly define a projectPath");
        }

        return errors;
      },
    });
  }

  get isDefaultProject() {
    return !Project.tryOf(this.node.scope) || Project.tryOf(this.node.scope) === this;
  }

  get parentProject() {
    return Project.of(this.node.scope);
  }

  get projects(): Project[] {
    return this.tryFindDeepChildren(Project);
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

  /**
   * Find all nodes by type that are owned by this project. Ownership is determined by the closest project scoped to a node.
   * @param childType
   */
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

  /**
   * Find all nodes by type that are owned by this project. Ownership is determined by the closest project scoped to a node.
   * Undefined is returned if the number of matching children is not exactly one.
   * @param childType
   */
  public tryFindDeepChild<
    T extends Constructor<any> = Constructor<any>,
    TRet extends InstanceType<T> = InstanceType<T>
  >(childType: T): TRet | undefined {
    const children = this.tryFindDeepChildren(childType);

    return (children.length === 1 && children[0]) || undefined;
  }

  /**
   * Find all nodes by type that are owned by this project. Ownership is determined by the closest project scoped to a node.
   * An error is thrown if the number of matching children is not exactly one.
   * @param childType
   */
  public findDeepChild<T extends Constructor<any> = Constructor<any>, TRet extends InstanceType<T> = InstanceType<T>>(
    childType: T
  ): TRet {
    const child = this.tryFindDeepChild(childType);

    if (!child) {
      throw new Error(`${this}: Project does not own a ${childType}`);
    }

    return child;
  }
}
