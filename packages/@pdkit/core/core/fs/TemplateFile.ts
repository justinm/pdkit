import mustache from "mustache";
import { Project } from "../project";
import { IFile, File } from "./File";

export interface ITemplate extends IFile {
  readonly variables?: Record<string, any>;
}

/**
 * See mustache
 */
export interface TemplateFileProps {
  readonly variables?: Record<string, any>;
}

/**
 * An XTemplate allows copying data to disk using the Mustache templating engine.
 */
export class TemplateFile extends File {
  public readonly variables?: Record<string, any>;

  constructor(scope: Project, filePath: string, props: TemplateFileProps) {
    super(scope, filePath);

    this.variables = props.variables;
  }

  /**
   * Returns the contents of the file path, parsed with mustache templating.
   */
  get content() {
    return mustache.render(this._content, this.variables);
  }
}
