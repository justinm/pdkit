import { sha1 } from "object-hash";

export const idFor = (prefix: string, fields?: Record<string, unknown>) => {
  if (fields) {
    return prefix + sha1(fields).substring(0, 7);
  }

  return prefix;
};
