export type AnyValue = any;
/**
 * @typedef {any} AnyValue
 */
/**
 * @param {AnyValue} o
 * @returns {o is null|undefined}
 */
export function isNullish(o: AnyValue): o is null | undefined;
import { v4 as uuid } from 'uuid';
/**
 * @param {object} obj
 * @param {string} prop
 * @returns {boolean}
 */
export function hasOwn(obj: object, prop: string): boolean;
/**
 * @param {AnyValue} opts
 */
export function parseCLIJSON(opts: AnyValue): any;
export { uuid };
//# sourceMappingURL=common.d.ts.map