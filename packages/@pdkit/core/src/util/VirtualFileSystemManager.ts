import path from "path";
import { IXFile } from "../xconstructs/XFile";
import { Volume } from "memfs/lib/volume";
import { IXProject, XProject } from "../xconstructs/XProject";
import { Workspace } from "../Workspace";
import { ConstructError } from "./ConstructError";
import { XConstruct } from "../xconstructs/XConstruct";
import { Construct } from "constructs";

/**
 * The VirtualFileSystemManager provides a staging area for writing files prior to persisting changes to disk.
 */
export class VirtualFileSystemManager extends XConstruct {
  readonly fs: Volume;
  private readonly creators: { [key: string]: { project: IXProject; files: string[] } } = {};

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.fs = new Volume();
  }

  readFile(file: IXFile) {
    const project = XProject.of(file);
    const filePath = path.join(project.projectPath, file.path);

    if (!this.fs.existsSync(filePath)) {
      return this.fs.readFileSync(filePath);
    }

    return undefined;
  }

  writeFile(file: IXFile) {
    const project = XProject.of(file);
    const filePath = path.join(project.projectPath, file.path);

    console.log(`${project.node.path} is attempting write to ${filePath}`);

    if (this.fs.existsSync(filePath)) {
      const creator = this.creatorOf(filePath);

      throw new ConstructError(project, `${filePath} is already owned by ${creator?.node.path ?? "N/A"}`);
    }

    this.claimCreator(project, filePath);
    this.ensureDirectory(filePath);

    this.fs.writeFileSync(filePath, file.content);
  }

  creatorOf(filePath: string): IXProject | undefined {
    const creatorAddr = Object.keys(this.creators).find((addr) => this.creators[addr].files.indexOf(filePath) !== -1);

    return creatorAddr ? this.creators[creatorAddr].project : undefined;
  }

  protected claimCreator(project: IXProject, filePath: string) {
    if (!this.creators[project.node.addr]) {
      this.creators[project.node.addr] = { project, files: [filePath] };
    } else {
      this.creators[project.node.addr].files.push(filePath);
    }
  }

  protected ensureDirectory(filePath: string) {
    const dirname = path.dirname(filePath);
    if (!this.fs.existsSync(dirname)) {
      this.fs.mkdirpSync(dirname);
    }
  }

  syncToDisk() {
    const workspace = Workspace.of(this);
    const rootPath = workspace.rootPath;

    const writeDirToDisk = (dir: string) => {
      const files = this.fs.readdirSync(dir) as string[];

      for (const file of files) {
        const virtualPath = path.join(dir, file);
        const realPath = path.join(rootPath, virtualPath);

        if (!this.fs.statSync(virtualPath).isDirectory()) {
          console.log(`Would write ${virtualPath} to ${realPath}`);
        } else {
          writeDirToDisk(virtualPath);
        }
      }
    };

    writeDirToDisk("/");
  }

  static of(construct: any) {
    const workspace = Workspace.of(construct);

    return workspace.vfs;
  }
}
