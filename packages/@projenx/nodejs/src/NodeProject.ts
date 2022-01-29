import { GitIgnore } from "./GitIgnore";
import { XFileSystemSynthesizer } from "../../core/src/synthesizers/XFileSystemSynthesizer";
import { NodePackageConfiguration, NodePackageConfigurationProps } from "./NodePackageConfiguration";
import { XProject } from "../../core/src/constructs/XProject";
import { Author } from "./Author";
import { Construct } from "constructs";
import { Workspace } from "../../core/src/Workspace";

export interface NodeProjectProps extends NodePackageConfigurationProps {}

export class NodeProject extends XProject {
  constructor(scope: Construct, id: string, props?: NodeProjectProps) {
    super(scope, id);

    new XFileSystemSynthesizer(this, "FileSystemSynthesizer");
    new GitIgnore(this, "Ignore", ["test?", "test", "cdk.out"]);
    const packageConfig = new NodePackageConfiguration(this, "Name", props);

    packageConfig.addFields({
      name: id,
      version: "0.0.0",
    });
  }
}

const workspace = new Workspace("projenx");
const project = new NodeProject(workspace, "@projenx/core");

new Author(project, "Author", {
  name: "Justin McCormick",
  email: "me@justinmccormick.com",
});

workspace.synthesize();
