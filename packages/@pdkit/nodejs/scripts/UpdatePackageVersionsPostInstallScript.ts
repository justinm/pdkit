import { spawnSync } from "child_process";
import fs from "fs";
import path from "path";
import { Manifest, PatchScript, Project, Workspace, XConstruct } from "@pdkit/core";

export class UpdatePackageVersionsPostInstallScript extends PatchScript {
  constructor(scope: XConstruct, id: string) {
    super(scope, id, () => {
      const { rootPath } = Workspace.of(this);
      const { projectPath } = Project.of(this);
      const manifest = Manifest.of(this);

      const realProjectPath = path.join(rootPath, projectPath);
      const manifestPath = path.join(rootPath, projectPath, manifest.path);
      const packageData = fs.readFileSync(manifestPath).toString("utf8");
      const versionData = spawnSync("npm", ["list", "--json"], {
        cwd: realProjectPath,
        env: process.env,
        stdio: "pipe",
      }).stdout.toString("utf8");

      const packageJson = JSON.parse(packageData);
      const versionJson = JSON.parse(versionData);

      ["dependencies", "devDependencies", "peerDendencies", "bundledDependencies"].forEach((key) => {
        if (packageJson[key]) {
          for (const dep of Object.keys(packageJson[key])) {
            if (packageJson[key][dep] === "*" && versionJson.dependencies && versionJson.dependencies[dep]) {
              if (versionJson.dependencies[dep].version) {
                packageJson[key][dep] = `^${versionJson.dependencies[dep].version}`;
              } else {
                if (versionJson.dependencies[dep].missing && versionJson.dependencies[dep].required !== "*") {
                  packageJson[key][dep] = `^${versionJson.dependencies[dep].required}`;
                }
              }
            }
          }
        }
      });

      fs.writeFileSync(manifestPath, JSON.stringify(packageJson, null, 2) + "\n", { mode: 0o666 });
    });
  }
}
