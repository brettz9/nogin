/**
 * @param {string} data
 * @returns {Promise<string>}
 */
export function saltAndHash(data: string): Promise<string>;
/**
 * @param {string} plainPass
 * @param {string} hashedPass
 * @returns {Promise<boolean>}
 */
export function validatePasswordV1(plainPass: string, hashedPass: string): Promise<boolean>;
//# sourceMappingURL=crypto.d.ts.map