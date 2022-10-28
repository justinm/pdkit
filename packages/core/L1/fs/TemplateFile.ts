import { Construct } from "constructs";
import mustache from "mustache";
import { LifeCycle, LifeCycleStage } from "../traits";
import { File, FileProps, IFile } from "./File";

export interface ITemplate extends IFile {
  readonly variables?: Record<string, any>;
}

/**
 * See mustache
 */
export interface TemplateFileProps extends FileProps {
  readonly variables?: Record<string, any>;
}

/**
 * A TemplateFile allows copying data to disk using the Mustache templating engine.
 */
export class TemplateFile extends Construct {
  private _content?: string;

  constructor(scope: Construct, id: string, props: TemplateFileProps) {
    super(scope, id);

    this._content = props.content;
    const file = new File(this, "Default", props);

    LifeCycle.implement(this);
    LifeCycle.of(this).on(LifeCycleStage.BEFORE_WRITE, () => {
      if (!this.content) {
        throw new Error(`Template ${this} did not contain any data to write`);
      }

      file.write(mustache.render(this.content, props.variables));
    });
  }

  get content() {
    return this._content;
  }
}
