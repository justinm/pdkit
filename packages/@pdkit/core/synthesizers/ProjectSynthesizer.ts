import { File } from "../fs";
import { IProject, IWorkspace, Project, Workspace } from "../project";

export interface IProjectSynthesizer {
  readonly workspace: IWorkspace;
  readonly project: IProject;

  synthesize(): void;
}

export class ProjectSynthesizer implements IProjectSynthesizer {
  public readonly project: IProject;
  public readonly workspace: IWorkspace;

  constructor(project: IProject) {
    this.project = project;
    this.workspace = Workspace.of(project);
  }

  synthesize() {
    const projects = this.project.tryFindDeepChildren(Project);

    for (const project of projects) {
      const files = project.tryFindDeepChildren(File);

      for (const file of files) {
        this.workspace.fileSynthesizer.writeVFile(this.project, file);
      }
    }
  }
}
