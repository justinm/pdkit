import mustache from "mustache";
import { Project } from "../Project";
import { IFile, File, FileProps } from "./File";

export interface ITemplate extends IFile {
  readonly variables?: Record<string, any>;
}

/**
 * See mustache
 */
export interface TemplateProps extends FileProps {
  readonly variables?: Record<string, any>;
}

/**
 * An XTemplate allows copying data to disk using the Mustache templating engine.
 */
export class Template extends File {
  public readonly variables?: Record<string, any>;

  constructor(scope: Project, id: string, props: TemplateProps) {
    super(scope, id, props);
  }

  /**
   * Returns the contents of the file path, parsed with mustache templating.
   */
  get content() {
    return mustache.render(this._content, this.variables);
  }
}
