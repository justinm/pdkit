import path from "path";
import fs from "fs";
import { Volume } from "memfs/lib/volume";
import { ConstructError } from "../util/ConstructError";
import logger from "../util/logger";
import { Workspace } from "../Workspace";
import { XConstruct } from "../base/XConstruct";
import { File, IFile } from "./File";

/**
 * The VirtualFS provides a staging area for writing files prior to persisting changes to disk.
 */
export class VirtualFS extends XConstruct {
  private readonly fs: Volume;

  constructor(scope: XConstruct, id: string) {
    super(scope, id);

    this.fs = new Volume();

    Workspace.of(this)._bind(this);
  }

  readFile(file: IFile) {
    const filePath = file.realPath;

    if (!this.fs.existsSync(filePath)) {
      return this.fs.readFileSync(filePath);
    }

    return undefined;
  }

  writeFile(file: IFile) {
    const filePath = file.realPath;

    logger.debug(`${file.node.path} is attempting write to ${filePath}`);

    if (this.fs.existsSync(filePath)) {
      const creator = this.creatorOf(filePath);

      throw new ConstructError(file, `${filePath} is already owned by ${creator?.node.path ?? "N/A"}`);
    }

    this.ensureDirectory(filePath);

    this.fs.writeFileSync(filePath, file.content);

    logger.debug(file.content);
  }

  creatorOf(filePath: string): IFile | undefined {
    return this.binds.filter((b) => b instanceof File).find((f) => (f as File).path === filePath) as IFile | undefined;
  }

  get files() {
    const ret: string[] = [];

    const scanFileSystem = (dir: string) => {
      const files = this.fs.readdirSync(dir) as string[];

      for (const file of files) {
        const virtualPath = path.join(dir, file);

        if (this.fs.statSync(virtualPath).isDirectory()) {
          scanFileSystem(virtualPath);
        } else {
          ret.push(virtualPath.substring(1));
        }
      }
    };

    scanFileSystem("/");

    return ret;
  }

  checkPathConflicts(filePath: string): string | null {
    const rootPath = Workspace.of(this).rootPath;
    const realPath = path.join(rootPath, filePath);

    if (fs.existsSync(realPath)) {
      const stat = fs.statSync(realPath);

      if (!stat.isFile()) {
        throw new Error(`${filePath}: is a directory`);
      } else {
        if (stat.mode & 600) {
          return "file may have external modifications " + stat.mode;
        }
      }
    }

    return null;
  }

  syncPathToDisk(filePath: string) {
    const rootPath = Workspace.of(this).rootPath;
    const realPath = path.join(rootPath, filePath);

    fs.writeFileSync(realPath, this.fs.readFileSync(path.join("/", filePath)), {
      mode: 0o600,
    });

    fs.chmodSync(realPath, 0o600);
  }

  protected ensureDirectory(filePath: string) {
    const dirname = path.dirname(filePath);
    if (!this.fs.existsSync(dirname)) {
      this.fs.mkdirpSync(dirname);
    }
  }

  static of(construct: any): VirtualFS {
    const vfs = Workspace.of(construct).binds.find((b) => b instanceof VirtualFS);

    if (!vfs) {
      throw new ConstructError(construct, "No VirtualFS was found");
    }

    return vfs as VirtualFS;
  }
}
