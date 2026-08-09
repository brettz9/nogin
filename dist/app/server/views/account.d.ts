/**
 * @param {{
 *   _: import('intl-dom').I18NCallback<string>,
 *   title: string,
 *   user: import('../modules/account-manager.js').AccountInfo
 *   countries: import('../routeList.js').CountryInfo[],
 *   emailPattern: string,
 *   requireName?: boolean
 * }} cfg
 */
declare const account: ({ _, user, countries, emailPattern, requireName, title }: {
    _: import('intl-dom').I18NCallback<string>;
    title: string;
    user: import('../modules/account-manager.js').AccountInfo;
    countries: import('../routeList.js').CountryInfo[];
    emailPattern: string;
    requireName?: boolean;
}) => ((string | {
    type: string;
    id: string;
    defaultValue: string | undefined;
})[] | (string | (string | (string | ((string | (string | (string | DocumentFragment | Text)[] | {
    class: string;
    'data-dismiss': string;
})[][] | {
    class: string;
})[] | (string | ((string | (string | (string | DocumentFragment | Text)[] | {
    'aria-hidden': string;
})[][] | {
    type: string;
    class: string;
    'data-dismiss': string;
    'aria-label': string;
})[] | (string | (string | DocumentFragment | Text)[] | {
    class: string;
    'data-name': string;
})[])[] | {
    class: string;
})[] | (string | (string | string[] | DocumentFragment | Text)[] | {
    class: string;
})[])[] | {
    class: string;
})[][] | {
    class: string;
    role: string;
})[][] | {
    class: string;
})[] | (string | (string | (string | (string | string[] | {
    class: string;
})[] | (string | string[] | {
    class: string;
    id: string;
})[] | (string | (string | {
    type: string;
    class: string;
    'data-name': string;
})[][] | {
    class: string;
})[] | (string | ((string | string[] | {
    class: string;
    for: string;
})[] | (string | (string | {
    type: string;
    autocomplete: string;
    minlength: number | null;
    class: string;
    id: string;
    'data-name': string;
    name: string;
    defaultValue: string;
})[][] | {
    class: string;
})[])[] | {
    class: string;
})[] | (string | ((string | string[] | {
    class: string;
    for: string;
})[] | (string | (string | {
    type: string;
    required: string;
    autocomplete: string;
    pattern: string;
    class: string;
    id: string;
    'data-name': string;
    name: string;
    defaultValue: string;
})[][] | {
    class: string;
})[])[] | {
    class: string;
})[] | (string | ((string | string[] | {
    class: string;
    for: string;
})[] | (string | (string | ((string | string[] | {
    value: string;
})[] | (string | string[] | {
    value: string;
    defaultSelected: boolean;
})[])[] | {
    autocomplete: string;
    class: string;
    id: string;
    name: string;
    'data-name': string;
})[][] | {
    class: string;
})[])[] | {
    class: string;
})[] | (string | ((string | string[] | {
    for: string;
    class: string;
})[] | (string | (string | {
    required: string;
    autocomplete: string | undefined;
    type: string;
    minlength: number;
    class: string;
    id: string;
    'data-name': string;
    name: string;
    defaultValue: string;
})[][] | {
    class: string;
})[])[] | {
    class: string;
})[])[] | {
    class: string;
    id: string;
    'data-name': string;
    method: string;
})[][] | {
    id: string;
    class: string;
    role: string;
})[])[];
export default account;
//# sourceMappingURL=account.d.ts.map