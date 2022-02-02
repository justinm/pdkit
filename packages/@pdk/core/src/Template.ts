import mustache from "mustache";
import { IXFile, XFile, XFileProps } from "./constructs/XFile";
import { XProject } from "./constructs/XProject";

export interface ITemplate extends IXFile {
  readonly variables?: Record<string, any>;
}

export interface TemplateProps extends XFileProps {
  /**
   *
   */
  readonly variables?: Record<string, any>;
}

/**
 * An XTemplate allows copying data to disk using the Mustache templating engine.
 */
export class Template extends XFile {
  public readonly variables?: Record<string, any>;

  constructor(scope: XProject, id: string, props: TemplateProps) {
    super(scope, id, props);
  }

  /**
   * Returns the contents of the file path, parsed with mustache templating.
   */
  get content() {
    return mustache.render(this._content, this.variables);
  }
}
