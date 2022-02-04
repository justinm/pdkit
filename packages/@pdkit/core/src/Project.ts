import { XProject, XProjectProps } from "./xconstructs/XProject";
import { Workspace } from "./Workspace";
import { License, ValidLicense } from "./License";
import logger from "./util/logger";

export interface ProjectProps extends XProjectProps {
  readonly license?: ValidLicense;
}

export class Project extends XProject {
  readonly license?: License;
  constructor(scope: Workspace | XProject, id: string, props?: ProjectProps) {
    super(scope, id, props);

    if (props?.license) {
      this.license = new License(this, "License", props.license);
    }

    this.node.addValidation({
      validate: () => {
        if (!this.license) {
          logger.warn(`Project ${id} does not have a license defined`);
        }

        return [];
      },
    });
  }

  public static is(construct: any) {
    return construct instanceof this;
  }
}
