import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      hasPrivilege: (priv: string) => Promise<boolean>;
    }
  }
}

export {};
