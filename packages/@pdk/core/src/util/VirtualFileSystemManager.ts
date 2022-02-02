import path from "path";
import { IXFile } from "../constructs/XFile";
import { Volume } from "memfs/lib/volume";
import { IXProject } from "../constructs/XProject";
import { Workspace } from "../Workspace";
import { ConstructError } from "./ConstructError";

export class VirtualFileSystemManager {
  readonly fs: Volume;
  private readonly creators: { [key: string]: { project: IXProject; files: string[] } } = {};

  constructor() {
    this.fs = new Volume();
  }

  readFile(project: IXProject, file: IXFile) {
    const filePath = path.join(project.projectPath, file.path);

    if (!this.fs.existsSync(filePath)) {
      return this.fs.readFileSync(filePath);
    }

    return undefined;
  }

  writeFile(project: IXProject, file: IXFile) {
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

  syncToDisk(workspace: Workspace) {
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
}
