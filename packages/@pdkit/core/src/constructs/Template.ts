import mustache from "mustache";
import { IFile, File } from "./File";
import { Project } from "../Project";

export interface ITemplate extends IFile {
  readonly variables?: Record<string, any>;
}

/**
 * See mustache
 */
export interface TemplateProps {
  readonly variables?: Record<string, any>;
  readonly path: string;
}

/**
 * An XTemplate allows copying data to disk using the Mustache templating engine.
 */
export class Template extends File {
  public readonly variables?: Record<string, any>;

  constructor(scope: Project, id: string, props: TemplateProps) {
    super(scope, id, props.path);
  }

  /**
   * Returns the contents of the file path, parsed with mustache templating.
   */
  get content() {
    return mustache.render(this._content, this.variables);
  }
}
