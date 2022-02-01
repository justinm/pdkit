import path from "path";
import { IXFile } from "../constructs/XFile";
import { Volume } from "memfs/lib/volume";

export class VirtualFileSystemManager {
  readonly root: string;
  readonly fs: Volume;

  constructor(root: string) {
    this.root = root;
    this.fs = new Volume();
  }

  readFile(file: IXFile) {
    const filePath = path.join("/", file.path);

    if (!this.fs.existsSync(filePath)) {
      return this.fs.readFileSync(filePath);
    }

    return undefined;
  }

  writeFile(file: IXFile) {
    const filePath = path.join("/", file.path);

    if (this.fs.existsSync(filePath)) {
      throw new Error("File collision detected: " + filePath);
    }

    this.fs.writeFileSync(filePath, file.content);
  }

  syncToDisk() {
    const writeDirToDisk = (dir: string) => {
      const files = this.fs.readdirSync(dir) as string[];

      for (const file of files) {
        const virtualPath = path.join(dir, file);
        const realPath = path.join(this.root, virtualPath);

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
