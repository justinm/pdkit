import fs from "fs";
import path from "path";
import { XConstruct } from "../base/XConstruct";
import { ConstructError } from "../util/ConstructError";
import { logger } from "../util/logger";
import { Project } from "./Project";
import { Workspace } from "./Workspace";

export class FileSystem extends XConstruct {
  static of(construct: any): FileSystem {
    const project = Project.of(construct);

    return project.findDeepChild(FileSystem);
  }

  constructor(scope: XConstruct) {
    super(scope, "FileSystem");
  }

  public tryReadFile(filePath: string) {
    const workspace = Workspace.of(this);
    const project = Project.of(this);
    const realPath = path.join(workspace.rootPath, project.projectPath, filePath);

    logger.debug(`tryReadFile(${realPath})`);

    if (fs.existsSync(realPath)) {
      return fs.readFileSync(realPath);
    }

    return undefined;
  }

  public readFile(filePath: string) {
    const data = this.tryReadFile(filePath);

    if (!data) {
      throw new ConstructError(this, `Cannot read file at: ${filePath}`);
    }

    return data;
  }

  public tryReadJsonFile<T = Record<string, unknown>>(filePath: string): T | undefined {
    const data = this.tryReadFile(filePath) as Buffer;

    if (data) {
      return JSON.parse(data.toString("utf8")) as T;
    } else {
      return undefined;
    }
  }

  public readJsonFile(filePath: string) {
    const data = this.tryReadJsonFile(filePath);

    if (!data) {
      throw new ConstructError(this, `No JSON data found at: ${filePath}`);
    }

    return data;
  }

  get absolutePath(): string {
    const workspace = Workspace.of(this);
    const project = Project.of(this);

    const parent = this.node.scopes.reverse().find((scope) => scope !== project && Project.is(scope)) as
      | Project
      | undefined;

    return path.join(workspace.rootPath, parent ? parent.projectPath : "/", project.projectPath ?? "");
  }
}
