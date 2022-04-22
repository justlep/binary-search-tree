/**
 * Check whether two values are equal (used in non-unique deletion)
 */
export const defaultCheckValueEquality = (a, b) => a === b;

const _hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * @param {*} obj
 * @param {string} prop
 * @return {boolean}
 */
export const hasOwnProp = (obj, prop) => obj ? _hasOwnProperty.call(obj, prop) : false;
