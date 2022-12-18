/**
 * This function checks has an object its own property
 */
export const hasOwnProperty = (object: object, property: string): boolean =>
  Object.prototype.hasOwnProperty.call(object, property);
