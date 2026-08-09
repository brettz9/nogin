import { v4 as uuid } from 'uuid';
export type AnyValue = any;
/**
 * @typedef {any} AnyValue
 */
/**
 * @param {AnyValue} o
 * @returns {o is null|undefined}
 */
declare const isNullish: (o: AnyValue) => o is null | undefined;
/**
 * @param {object} obj
 * @param {string} prop
 * @returns {boolean}
 */
declare const hasOwn: (obj: object, prop: string) => boolean;
/**
 * @param {AnyValue} opts
 */
declare const parseCLIJSON: (opts: AnyValue) => any;
export { isNullish, uuid, hasOwn, parseCLIJSON };
//# sourceMappingURL=common.d.ts.map