import { Manifest, PostInstallScript, Project, Workspace, XConstruct } from "../../../core/src";
import path from "path";
import fs from "fs";
import { spawnSync } from "child_process";

export class UpdatePackageVersionsPostInstallScript extends PostInstallScript {
  constructor(scope: XConstruct, id: string) {
    super(scope, id);
  }

  _afterExecute() {
    const { rootPath } = Workspace.of(this);
    const { projectPath } = Project.of(this);
    const manifest = Manifest.of(this);

    const realProjectPath = path.join(rootPath, projectPath);
    const manifestPath = path.join(rootPath, projectPath, manifest.path);
    const packageData = fs.readFileSync(manifestPath).toString("utf8");
    const versionData = spawnSync("npm", ["list", "-json"], {
      cwd: realProjectPath,
      env: process.env,
      stdio: "pipe",
    }).stdout.toString("utf8");

    const packageJson = JSON.parse(packageData);
    const versionJson = JSON.parse(versionData);

    ["dependencies", "devDependencies", "peerDendencies", "bundledDependencies"].forEach((key) => {
      if (packageJson[key]) {
        for (const dep of Object.keys(packageJson[key])) {
          if (packageJson[key][dep] === "*" && versionJson[key][dep]["version"]) {
            packageJson[key][dep] = `^${versionJson[key][dep]["version"]}`;
          }
        }
      }
    });

    fs.writeFileSync(manifestPath, JSON.stringify(packageJson, null, 2) + "\n", { mode: 0o666 });
  }
}
