export type PrivilegeType = "boolean" | "string" | "number" | "array" | "object";
/**
 * @typedef {"boolean"|"string"|"number"|"array"|"object"} PrivilegeType
 */
/**
 * Selects the value field to use for a privilege of the given `type`, showing
 * a textarea for string, array, and object values and the plain input for
 * boolean and number values, and configuring `hidden`, `disabled`,
 * `required`, and (for the input) `type` on both fields. Both fields are
 * cleared.
 * @param {HTMLInputElement} input
 * @param {HTMLTextAreaElement} textarea
 * @param {PrivilegeType|string} type
 * @returns {HTMLInputElement|HTMLTextAreaElement} The active field.
 */
export declare function prepareValueField(input: HTMLInputElement, textarea: HTMLTextAreaElement, type: PrivilegeType | string): HTMLInputElement | HTMLTextAreaElement;
/**
 * Validates that `field` holds JSON text which parses to the kind expected for
 * `type` (`"array"` or `"object"`), setting a custom validity message when it
 * does not. Returns `true` for any other `type`, as there is nothing to
 * validate against `JSON.parse` in those cases.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {PrivilegeType|string} type
 * @returns {boolean}
 */
export declare function validatePrivilegeJSON(field: HTMLInputElement | HTMLTextAreaElement, type: PrivilegeType | string): boolean;
//# sourceMappingURL=privilegeValue.d.ts.map