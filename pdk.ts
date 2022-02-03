import { Workspace } from "./packages/@pdkit/core/src/Workspace";
import { NodeProject } from "./packages/@pdkit/nodejs/src/xconstructs/NodeProject";

export const workspace = new Workspace("pdk");

const core = new NodeProject(workspace, "core", {
  packageName: "@pdk/core",
  projectPath: "packages/@pdk/core",
  authorName: "Justin McCormick",
  authorEmail: "me@justinmccormick.com",
  authorOrganization: true,
});

new NodeProject(core, "node", { packageName: "@pdk/node", projectPath: "packages/@pdk/node" });
