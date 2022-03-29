import { XConstruct } from "../base/XConstruct";

export class StandardValidator extends XConstruct {
  constructor(scope: XConstruct, id: string) {
    super(scope, id);

    this.node.addValidation({
      validate: () => {
        const errors: string[] = [];

        return errors;
      },
    });
  }
}
