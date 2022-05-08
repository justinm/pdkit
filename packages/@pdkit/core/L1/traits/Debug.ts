import { Construct, IConstruct } from "constructs";

export interface IDebug extends IConstruct {}

export abstract class Debug {
  public static implement<T extends Construct>(instance: IDebug, context?: Record<string, unknown>) {
    console.log("Will debug " + instance.node.id);
    (instance as any).toString = `${instance.constructor.name}[${instance.node.path}/${instance.node.id}]`;
  }
}
