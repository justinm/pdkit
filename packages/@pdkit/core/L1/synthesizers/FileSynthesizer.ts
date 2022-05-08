import * as crypto from "crypto";
import fs from "fs";
import path from "path";
import { Construct } from "constructs";
import { Volume } from "memfs/lib/volume";
import { logger } from "../../util/logger";
import { File, IFile } from "../fs";
import { IProject, Project, Workspace } from "../project";
import { Bindings, LifeCycle, LifeCycleStage } from "../traits";

/**
 * The FileSynthesizer provides a staging area for writing files prior to persisting changes to disk.
 */
export class FileSynthesizer extends Construct {
  public static readonly ID = "FileSynthesizer";

  public static of(construct: Construct): FileSynthesizer {
    const project = Project.of(construct);
    const synthesizer = Bindings.of(project).findByClass<FileSynthesizer>(this);

    if (!synthesizer) {
      throw new Error(`${construct}: No FileSynthesizer was found in the project ${project.node.path}`);
    }

    return synthesizer;
  }

  public readonly rootPath: string;
  private readonly fs: Volume;
  private readonly owners: Record<string, IFile>;

  constructor(scope: Construct) {
    super(scope, FileSynthesizer.ID);
    this.fs = new Volume();
    this.owners = {};

    const workspace = Workspace.of(this);
    const project = Project.of(this);

    this.rootPath = workspace.rootPath;

    Bindings.of(project).bind(this);

    LifeCycle.implement(this);
    LifeCycle.of(this).on(LifeCycleStage.WRITE, () => {
      const files = Bindings.of(project).filterByClass(File);

      for (const file of files) {
        this.writeVFile(project, file);
      }
    });
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

    if (!file.content || file.content === "") {
      logger.warn(`${file.node.path} is attempting write to ${filePath} with no data`);
    } else {
      logger.silly(`${file.node.path} is attempting write to ${filePath} with: ${file.content}`);
    }

    if (this.fs.existsSync(filePath)) {
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
