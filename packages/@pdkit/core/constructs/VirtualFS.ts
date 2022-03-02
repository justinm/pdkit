import fs from "fs";
import path from "path";
import { Volume } from "memfs/lib/volume";
import { XConstruct } from "../base/XConstruct";
import { ConstructError } from "../util/ConstructError";
import { logger } from "../util/logger";
import { IFile } from "./File";
import { Workspace } from "./Workspace";

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

  checkPathConflicts(filePath: string): string | null {
    const rootPath = Workspace.of(this).rootPath;
    const realPath = path.join(rootPath, filePath);

    if (fs.existsSync(realPath)) {
      const stat = fs.statSync(realPath);

      if (!stat.isFile()) {
        throw new Error(`${filePath}: is a directory`);
      } else {
        // TODO fix this
        // eslint-disable-next-line no-bitwise
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

    this.ensureDirectory(realPath, fs);

    fs.writeFileSync(realPath, this.fs.readFileSync(path.join("/", filePath)), {
      mode: 0o600,
    });

    fs.chmodSync(realPath, 0o600);
  }

  protected ensureDirectory(filePath: string, fst: Volume | typeof fs) {
    const dirname = path.dirname(filePath);

    if (!fst.existsSync(dirname)) {
      fst.mkdirSync(dirname, { recursive: true });
    }
  }
}