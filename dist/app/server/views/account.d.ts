export default account;
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
declare function account({ _, user, countries, emailPattern, requireName, title }: {
    _: import('intl-dom').I18NCallback<string>;
    title: string;
    user: import('../modules/account-manager.js').AccountInfo;
    countries: import('../routeList.js').CountryInfo[];
    emailPattern: string;
    requireName?: boolean;
}): ((string | {
    class: string;
} | (string | {
    class: string;
    role: string;
} | (string | {
    class: string;
} | ((string | {
    class: string;
} | ((string | (string | Text | DocumentFragment)[] | {
    class: string;
    'data-name': string;
})[] | (string | {
    type: string;
    class: string;
    'data-dismiss': string;
    'aria-label': string;
} | (string | (string | Text | DocumentFragment)[] | {
    'aria-hidden': string;
})[][])[])[])[] | (string | {
    class: string;
} | (string | string[] | Text | DocumentFragment)[])[] | (string | {
    class: string;
} | (string | (string | Text | DocumentFragment)[] | {
    class: string;
    'data-dismiss': string;
})[][])[])[])[][])[][])[] | (string | {
    type: string;
    id: string;
    defaultValue: string | undefined;
})[] | (string | {
    id: string;
    class: string;
    role: string;
} | (string | {
    class: string;
    id: string;
    'data-name': string;
    method: string;
} | (string | (string | string[] | {
    class: string;
})[] | (string | string[] | {
    class: string;
    id: string;
})[] | (string | {
    class: string;
} | ((string | string[] | {
    class: string;
    for: string;
})[] | (string | {
    class: string;
} | (string | {
    type: string;
    autocomplete: string;
    minlength: number | null;
    class: string;
    id: string;
    'data-name': string;
    name: string;
    defaultValue: string;
})[][])[])[])[] | (string | {
    class: string;
} | ((string | string[] | {
    class: string;
    for: string;
})[] | (string | {
    class: string;
} | (string | {
    type: string;
    required: string;
    autocomplete: string;
    pattern: string;
    class: string;
    id: string;
    'data-name': string;
    name: string;
    defaultValue: string;
})[][])[])[])[] | (string | {
    class: string;
} | ((string | string[] | {
    class: string;
    for: string;
})[] | (string | {
    class: string;
} | (string | {
    autocomplete: string;
    class: string;
    id: string;
    name: string;
    'data-name': string;
} | ((string | string[] | {
    value: string;
    defaultSelected: boolean;
})[] | (string | string[] | {
    value: string;
})[])[])[][])[])[])[] | (string | {
    class: string;
} | ((string | string[] | {
    for: string;
    class: string;
})[] | (string | {
    class: string;
} | (string | {
    required: string;
    autocomplete: string | undefined;
    type: string;
    minlength: number;
    class: string;
    id: string;
    'data-name': string;
    name: string;
    defaultValue: string;
})[][])[])[])[] | (string | {
    class: string;
} | (string | {
    type: string;
    class: string;
    'data-name': string;
})[][])[])[])[][])[])[];
//# sourceMappingURL=account.d.ts.map