declare module 'express' {
  interface Request {
    hasPrivilege?: (priv: string) => Promise<boolean>;
  }
}
export {};
