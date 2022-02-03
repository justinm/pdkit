import { NodeProject } from "./packages/@pdkit/nodejs/src/xconstructs/NodeProject";
import { YarnMonoRepo } from "./packages/@pdkit/nodejs/src/YarnMonoRepo";

export const workspace = new YarnMonoRepo("pdkit", {
  projectPath: "packages/@pdk/core",
  authorName: "Justin McCormick",
  authorEmail: "me@justinmccormick.com",
  authorOrganization: true,
  devDependencies: {
    "@pdkit/nodejs": "^0.0.0",
    "@types/mustache": "^4.1.2",
    "@types/node": "^17.0.13",
    prettier: "^2.5.1",
    projen: "^0.52.5",
    "ts-node": "^10.4.0",
    typescript: "^4.5.5",
  },
});

new NodeProject(workspace, "core", {
  packageName: "@pdkit/core",
  projectPath: "packages/@pdkit/core",
});

new NodeProject(workspace, "nodejs", { packageName: "@pdkit/nodejs", projectPath: "packages/@pdkit/nodejs" });
