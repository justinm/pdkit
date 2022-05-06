import { Construct } from "constructs";

Construct.prototype.toString = function () {
  return `${this.constructor.name}[${this.node.path}]`;
};

export * from "./core";
export * as cloud from "./cloud";
export * as nodejs from "./nodejs";
export * as github from "./github";
