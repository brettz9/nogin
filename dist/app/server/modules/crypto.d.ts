/**
 * @param {string} data
 * @returns {Promise<string>}
 */
declare const saltAndHash: (data: string) => Promise<string>;
/**
 * @param {string} plainPass
 * @param {string} hashedPass
 * @returns {Promise<boolean>}
 */
declare const validatePasswordV1: (plainPass: string, hashedPass: string) => Promise<boolean>;
export { saltAndHash, validatePasswordV1 };
//# sourceMappingURL=crypto.d.ts.map