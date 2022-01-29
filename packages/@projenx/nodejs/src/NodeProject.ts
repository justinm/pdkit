import { GitIgnore } from "./GitIgnore";
import { XFileSystemSynthesizer } from "../../core/src/synthesizers/XFileSystemSynthesizer";
import { NodePackageConfiguration, NodePackageConfigurationProps } from "./NodePackageConfiguration";
import { XProject } from "../../core/src/constructs/XProject";
import { Author } from "./Author";
import { Construct } from "constructs";
import { Workspace } from "../../core/src/Workspace";
import { NodePackageManager } from "./constructs/NodePackageManager";
import { YarnSupport } from "./YarnSupport";

export enum PackageManager {
  YARN,
  NPM,
}

export interface NodeProjectProps extends NodePackageConfigurationProps {
  packageManager?: PackageManager;
}

export class NodeProject extends XProject {
  readonly gitignore: GitIgnore;
  readonly packageJson: NodePackageConfiguration;
  readonly packageManager: NodePackageManager;

  constructor(scope: Construct, id: string, props?: NodeProjectProps) {
    super(scope, id);

    new XFileSystemSynthesizer(this, "FileSystemSynthesizer");
    this.gitignore = new GitIgnore(this, "Ignore", ["test?", "test", "cdk.out"]);
    this.packageJson = new NodePackageConfiguration(this, "Name", {
      ...props,
      name: id,
    });

    switch (props?.packageManager) {
      case PackageManager.YARN:
      default:
        this.packageManager = new YarnSupport(this, "Yarn");
    }

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];
        const rootProject = this.node.scopes.reverse().find((s) => s instanceof NodeProject);
        const hasPackageManager = !!rootProject?.node.children.find((c) => c instanceof NodePackageManager);

        if (!hasPackageManager) {
          errors.push("The root node project must contain a package manager");
        }

        return errors;
      },
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
