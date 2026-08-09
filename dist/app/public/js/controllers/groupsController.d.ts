import '../polyfills/Error.js';
import '../polyfills/console.js';
export type AjaxPostError = Error & {
    text: string;
    responseText: string;
    statusText?: string;
};
//# sourceMappingURL=groupsController.d.ts.map