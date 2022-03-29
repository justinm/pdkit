import * as crypto from "crypto";
import fs from "fs";
import path from "path";
import { Construct } from "constructs";
import { Volume } from "memfs/lib/volume";
import { XConstruct } from "../base/XConstruct";
import { AppendableFile, IFile } from "../fs";
import { IProject } from "../project";
import { logger } from "../util/logger";

/**
 * The FileSynthesizer provides a staging area for writing files prior to persisting changes to disk.
 */
export class FileSynthesizer extends XConstruct {
  public static readonly ID = "FileSynthesizer";
  public readonly rootPath: string;
  private readonly fs: Volume;
  private owners: Record<string, IFile>;

  constructor(rootPath: string) {
    super(undefined as any, FileSynthesizer.ID);
    this.fs = new Volume();
    this.owners = {};
    this.rootPath = rootPath;
  }

  readVFile(pathRelativeToWorkspace: string) {
    const filePath = path.join("/", pathRelativeToWorkspace);

    if (this.fs.existsSync(filePath)) {
      return this.fs.readFileSync(filePath).toString("utf8");
    }

    return undefined;
  }

  writeVFile(project: IProject, file: IFile) {
    const filePath = path.join(project.projectPath, file.filePath);

    logger.debug(`${file.node.path} is attempting write to ${filePath}`);

    if (!(file instanceof AppendableFile) && this.fs.existsSync(filePath)) {
      const creator = this.creatorOf(filePath);

      throw new Error(`${file}: ${filePath} is already owned by ${creator?.node.path ?? "N/A"}`);
    }

    this.owners[filePath] = file;

    this.ensureDirectory(filePath, this.fs);

    this.fs.appendFileSync(filePath, file.content);
  }

  get virtualFiles() {
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

  realFileExists(filePath: string): boolean {
    const realPath = path.join(this.rootPath, filePath);

    return fs.existsSync(realPath);
  }

  realFileIsDirectory(filePath: string): boolean {
    const realPath = path.join(this.rootPath, filePath);

    return fs.statSync(realPath).isDirectory();
  }

  realFileIsOwned(filePath: string): boolean {
    const realPath = path.join(this.rootPath, filePath);

    // eslint-disable-next-line no-bitwise
    return (fs.statSync(realPath).mode & 0o1000) > 0;
  }

  realFileIsDifferent(filePath: string): boolean {
    const realPath = path.join(this.rootPath, filePath);

    try {
      const onDiskChecksum = crypto.createHash("md5").update(fs.readFileSync(realPath)).digest("hex");
      const memoryChecksum = crypto
        .createHash("md5")
        .update(this.fs.readFileSync(path.join("/", filePath)))
        .digest("hex");

      return onDiskChecksum !== memoryChecksum;
    } catch (err) {
      return true;
    }
  }

  syncVFileToDisk(filePath: string): boolean {
    const realPath = path.join(this.rootPath, filePath);

    this.ensureDirectory(realPath, fs);

    // eslint-disable-next-line no-bitwise
    fs.writeFileSync(realPath, this.fs.readFileSync(path.join("/", filePath)));

    // eslint-disable-next-line no-bitwise
    fs.chmodSync(realPath, fs.statSync(realPath).mode | 0o1000);

    return true;
  }

  public tryReadRealFile(who: Construct, filePath: string) {
    const realPath = path.join(this.rootPath, filePath);

    logger.silly(`${who} is trying tryReadFile(${realPath})`);

    if (fs.existsSync(realPath)) {
      return fs.readFileSync(realPath);
    }

    return undefined;
  }

  public readRealFile(who: Construct, filePath: string) {
    const data = this.tryReadRealFile(who, filePath);

    if (!data) {
      throw new Error(`Cannot read file at: ${filePath}`);
    }

    return data;
  }

  public tryReadRealJsonFile<T = Record<string, unknown>>(who: Construct, filePath: string): T | undefined {
    const data = this.tryReadRealFile(who, filePath) as Buffer;

    if (data) {
      return JSON.parse(data.toString("utf8")) as T;
    } else {
      return undefined;
    }
  }

  public readRealJsonFile(who: Construct, filePath: string) {
    const data = this.tryReadRealJsonFile(who, filePath);

    if (!data) {
      throw new Error(`${who}: No JSON data found at: ${filePath}`);
    }

    return data;
  }

  protected creatorOf(filePath: string): IFile | undefined {
    return this.owners[filePath];
  }

  protected ensureDirectory(filePath: string, fst: Volume | typeof fs) {
    const dirname = path.dirname(filePath);

    if (!fst.existsSync(dirname)) {
      fst.mkdirSync(dirname, { recursive: true });
    }
  }
}
