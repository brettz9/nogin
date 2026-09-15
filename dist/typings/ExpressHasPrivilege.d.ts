import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      hasPrivilege: (priv: string) => Promise<boolean>;
      /**
       * Resolves to the privilege's actual stored value: `true` for root
       * access or a `boolean`-typed privilege's grant, the privilege's
       * `PrivilegeValue` for any other type, or `undefined` when the
       * privilege isn't held at all.
       */
      getPrivilegeValue: (priv: string) => Promise<
        import('../app/server/modules/account-manager.js').PrivilegeValue|
        boolean|undefined
      >;
      /**
       * The full set of privileges the session holds, in the same
       * `{root, privs}` shape `/_privs` sends the browser as
       * `window.NoginPrivs`.
       */
      getPrivileges: () => Promise<{
        root: boolean,
        privs: {[key: string]: (
          import('../app/server/modules/account-manager.js').PrivilegeValue|
          boolean
        )}
      }>;
    }
  }
}

export {};
