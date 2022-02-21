import * as Case from "case";

export function arrayOrScalar<T>(arr: T[] | undefined): T | T[] | undefined {
  if (arr == null || arr.length === 0) {
    return undefined;
  }
  if (arr.length === 1) {
    return arr[0];
  }
  return arr;
}

export function decamelize(s: string, sep: string = "_") {
  if (Case.of(s) === "camel") {
    return Case.lower(s, sep);
  } else {
    return s;
  }
}

export function snakeCaseKeys<T = unknown>(obj: T): T {
  if (typeof obj !== "object" || obj == null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(snakeCaseKeys) as any;
  }

  const result: Record<string, unknown> = {};
  for (let [k, v] of Object.entries(obj)) {
    if (typeof v === "object" && v != null) {
      v = snakeCaseKeys(v);
    }
    result[Case.snake(k)] = v;
  }
  return result as any;
}

export function kebabCaseKeys<T = unknown>(obj: T, recursive = true): T {
  if (typeof obj !== "object" || obj == null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    if (recursive) {
      obj = obj.map((v) => kebabCaseKeys(v, recursive)) as any;
    }
    return obj;
  }

  const result: Record<string, unknown> = {};
  for (let [k, v] of Object.entries(obj)) {
    if (recursive) {
      v = kebabCaseKeys(v, recursive);
    }
    result[decamelize(k).replace(/_/gm, "-")] = v;
  }
  return result as any;
}
