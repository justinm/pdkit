import path from "path";
import { Construct, IConstruct } from "constructs";
import { logger } from "../../util/logger";
import { File } from "../fs";
import { FileSynthesizer } from "../synthesizers";
import { Bindings } from "../traits";
import { Workspace } from "./Workspace";

export interface IProject extends IConstruct {
  readonly projectRelativeSourcePath: string;
  readonly projectPath: string;
  readonly sourcePath: string;
  readonly buildPath: string;
  readonly parentProject: IProject;
  readonly projects: IProject[];
}

export interface ProjectProps {
  readonly projectPath?: string;
  readonly sourcePath?: string;
  readonly fileSynthesizer?: FileSynthesizer;
  readonly buildPath?: string;
}

export abstract class Project extends Construct implements IProject {
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
    if (!(construct instanceof Construct)) {
      throw new Error(`${construct.constructor.name} is not a construct`);
    }

    if (construct instanceof Project) {
      return construct;
    }

    let project = (construct as Construct).node.scopes.reverse().find((scope) => scope !== construct && scope instanceof Project);

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
  private readonly _buildPath: string;

  constructor(scope: Construct, id: string, props?: ProjectProps) {
    super(scope, id);

    this._projectPath = props?.projectPath;
    this._sourcePath = props?.sourcePath ?? "src";
    this._buildPath = props?.buildPath ?? "build";

    const workspace = Workspace.of(this);

    Bindings.implement(this, {
      onAcceptChild: (child) => {
        if (child instanceof File && Project.of(child) === this) {
          logger.silly(`Will auto bind file ${child} to project ${this}`);
          Bindings.of(this).bind(child);
        }
      },
    });
    Bindings.of(workspace).bind(this);

    new FileSynthesizer(this);

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

  public fileForPath(filePath: string) {
    return Bindings.of(this)
      .filterByClass(File)
      .find((file) => file.filePath === filePath);
  }

  get isDefaultProject() {
    return !Project.tryOf(this.node.scope) || Project.tryOf(this.node.scope) === this;
  }

  get parentProject() {
    return Project.of(this);
  }

  get projects(): Project[] {
    return Bindings.of(this).filterByClass(Project);
  }

  get projectPath(): string {
    const parent = this.node.scopes.reverse().find((scope) => scope !== this && Project.is(scope)) as Project | undefined;

    return path.join(parent ? parent.projectPath : "/", this._projectPath ?? "");
  }

  get projectRelativeSourcePath(): string {
    return path.join(this.projectPath, this._sourcePath).substring(1);
  }

  get sourcePath(): string {
    return this._sourcePath;
  }

  get buildPath(): string {
    return this._buildPath;
  }
}
