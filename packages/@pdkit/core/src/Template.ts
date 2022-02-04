import mustache from "mustache";
import { IXFile, XFile } from "./xconstructs/XFile";
import { XProject } from "./xconstructs/XProject";

export interface ITemplate extends IXFile {
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
export class Template extends XFile {
  public readonly variables?: Record<string, any>;

  constructor(scope: XProject, id: string, props: TemplateProps) {
    super(scope, id, props.path);
  }

  /**
   * Returns the contents of the file path, parsed with mustache templating.
   */
  get content() {
    return mustache.render(this._content, this.variables);
  }
}
