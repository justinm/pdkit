import { XConstruct } from "../base/XConstruct";
import { VirtualFS } from "../constructs/VirtualFS";
import logger from "../util/logger";

export class StandardValidator extends XConstruct {
  constructor(scope: XConstruct, id: string) {
    super(scope, id);

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];

        try {
          VirtualFS.of(this);
        } catch (err) {
          logger.warn("No VirtualFS could be found, files will not be written to disk");
        }

        return errors;
      },
    });
  }
}
