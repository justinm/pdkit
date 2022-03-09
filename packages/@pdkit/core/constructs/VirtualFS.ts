import * as crypto from "crypto";
import fs from "fs";
import path from "path";
import { Volume } from "memfs/lib/volume";
import { XConstruct } from "../base/XConstruct";
import { ConstructError } from "../util/ConstructError";
import { logger } from "../util/logger";
import { IFile } from "./File";
import { Workspace } from "./Workspace";

export enum FileStatus {
  OK,
  CONFLICT,
  NO_CHANGE,
}

/**
 * The VirtualFS provides a staging area for writing files prior to persisting changes to disk.
 */
export class VirtualFS extends XConstruct {
  static of(construct: any): VirtualFS {
    const vfs = Workspace.of(construct)
      .node.findAll()
      .find((b) => b instanceof VirtualFS);

    if (!vfs) {
      throw new ConstructError(construct, "No VirtualFS was found");
    }

    return vfs as VirtualFS;
  }

  private readonly fs: Volume;
  private owners: Record<string, IFile>;

  constructor(scope: XConstruct, id: string) {
    super(scope, id);

    this.fs = new Volume();
    this.owners = {};
  }

  readFile(file: IFile) {
    const filePath = file.projectRelativePath;

    if (!this.fs.existsSync(filePath)) {
      return this.fs.readFileSync(filePath);
    }

    return undefined;
  }

  writeFile(file: IFile) {
    const filePath = file.projectRelativePath;

    logger.debug(`${file.node.path} is attempting write to ${filePath}`);

    if (!file.appendMode && this.fs.existsSync(filePath)) {
      const creator = this.creatorOf(filePath);

      throw new ConstructError(file, `${filePath} is already owned by ${creator?.node.path ?? "N/A"}`);
    }

    this.owners[filePath] = file;

    this.ensureDirectory(filePath, this.fs);

    this.fs.appendFileSync(filePath, file.content);
  }

  creatorOf(filePath: string): IFile | undefined {
    return this.owners[filePath];
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

  getFileStatus(filePath: string): FileStatus {
    const rootPath = Workspace.of(this).rootPath;
    const realPath = path.join(rootPath, filePath);

    if (fs.existsSync(realPath)) {
      const stat = fs.statSync(realPath);

      if (!stat.isFile()) {
        throw new Error(`${filePath}: is a directory`);
      } else {
        // eslint-disable-next-line no-bitwise
        if (!(stat.mode & 0o1000)) {
          return FileStatus.CONFLICT;
        }

        try {
          const onDiskChecksum = crypto.createHash("md5").update(fs.readFileSync(realPath)).digest("hex");
          const memoryChecksum = crypto.createHash("md5").update(this.fs.readFileSync(filePath)).digest("hex");

          if (onDiskChecksum === memoryChecksum) {
            return FileStatus.NO_CHANGE;
          }
        } catch (err) {
          logger.warn(`Failed to hash files: ${err}`);
        }
      }
    }

    return FileStatus.OK;
  }

  checkPathConflicts(filePath: string): boolean {
    const status = this.getFileStatus(filePath);

    return status === FileStatus.CONFLICT;
  }

  syncPathToDisk(filePath: string) {
    const rootPath = Workspace.of(this).rootPath;
    const realPath = path.join(rootPath, filePath);

    this.ensureDirectory(realPath, fs);

    // eslint-disable-next-line no-bitwise
    fs.writeFileSync(realPath, this.fs.readFileSync(path.join("/", filePath)));

    // eslint-disable-next-line no-bitwise
    fs.chmodSync(realPath, fs.statSync(realPath).mode | 0o1000);
  }

  protected ensureDirectory(filePath: string, fst: Volume | typeof fs) {
    const dirname = path.dirname(filePath);

    if (!fst.existsSync(dirname)) {
      fst.mkdirSync(dirname, { recursive: true });
    }
  }
}
