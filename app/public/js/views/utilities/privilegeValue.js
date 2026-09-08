/* globals Nogin -- `Nogin` is server-set */

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
export function prepareValueField (input, textarea, type) {
  const useTextarea = ['string', 'array', 'object'].includes(type);
  const active = /** @type {HTMLInputElement|HTMLTextAreaElement} */ (
    useTextarea ? textarea : input
  );
  const inactive = /** @type {HTMLInputElement|HTMLTextAreaElement} */ (
    useTextarea ? input : textarea
  );
  active.value = '';
  inactive.value = '';
  active.hidden = false;
  inactive.hidden = true;
  inactive.disabled = true;
  inactive.required = false;
  active.disabled = type === 'boolean';
  active.required = type !== 'boolean';
  if (!useTextarea) {
    input.type = type === 'number' ? 'number' : 'text';
  }
  return active;
}

/**
 * Validates that `field` holds JSON text which parses to the kind expected for
 * `type` (`"array"` or `"object"`), setting a custom validity message when it
 * does not. Returns `true` for any other `type`, as there is nothing to
 * validate against `JSON.parse` in those cases.
 * @param {HTMLInputElement|HTMLTextAreaElement} field
 * @param {PrivilegeType|string} type
 * @returns {boolean}
 */
export function validatePrivilegeJSON (field, type) {
  field.setCustomValidity('');
  if (type !== 'array' && type !== 'object') {
    return true;
  }
  let parsed;
  let parseSucceeded = true;
  try {
    parsed = JSON.parse(field.value);
  } catch (err) {
    parseSucceeded = false;
  }
  const valid = parseSucceeded && (type === 'array'
    ? Array.isArray(parsed)
    : typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed));
  if (!valid) {
    field.setCustomValidity(
      /** @type {string} */ (Nogin._('PleaseEnterValidJSON'))
    );
    return false;
  }
  return true;
}
