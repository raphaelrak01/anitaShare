export function isEmptyObject(obj: any): boolean {
  if (typeof obj !== 'object' || obj === null) return true;
  return Object.keys(obj).length === 0;
}

export function dataContainsObjectsWithKey(arr: Array<any>, key: string) {
  return arr.every((item) => {
    return typeof item === 'object' && item !== null && key in item;
  });
}

export function objectHasKey(obj: any, key: string) {
  return typeof obj === 'object' && obj !== null && key in obj;
}
