/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   type: string,
 *   inputDirections: string
 *   autocomplete?: string[]
 *   additionalFields?: import('jamilih').JamilihArray[]
 * }} cfg
 * @returns {import('jamilih').JamilihArray}
 */
declare const singleInputForm: ({ _, type, inputDirections, autocomplete, additionalFields }: {
    _: import('intl-dom').I18NCallback;
    type: string;
    inputDirections: string;
    autocomplete?: string[];
    additionalFields?: import('jamilih').JamilihArray[];
}) => import('jamilih').JamilihArray;
export default singleInputForm;
//# sourceMappingURL=single-input-form.d.ts.map