import { Construct } from "constructs";

Construct.prototype.toString = function () {
  return `${this.constructor.name}[${this.node.path}]`;
};

export const SG_CONFIG_FILE = ".stackgenrc.ts";

export * from "./L1";
export * from "./L2";
export * from "./L3";
