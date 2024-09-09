export default confirm;
/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   type: string
 * }} cfg
 */
declare function confirm({ _, type }: {
    _: import("intl-dom").I18NCallback;
    type: string;
}): (string | {
    class: string;
    'data-name': string;
    'data-confirm-type': string;
} | (string | {
    class: string;
    role: string;
} | (string | {
    class: string;
} | ((string | {
    class: string;
} | ((string | {
    class: string;
    'data-name': string;
})[] | (string | {
    type: string;
    class: string;
    'data-dismiss': string;
    'aria-label': string;
} | (string | (string | Text | DocumentFragment)[] | {
    'aria-hidden': string;
})[][])[])[])[] | (string | string[][] | {
    class: string;
    'data-name': string;
})[] | (string | {
    class: string;
} | ((string | (string | Text | DocumentFragment)[] | {
    class: string;
    'data-name': string;
    'data-dismiss': string;
})[] | (string | (string | Text | DocumentFragment)[] | {
    'data-name': string;
    class: string;
})[])[])[])[])[][])[][])[];
//# sourceMappingURL=confirm.d.ts.map