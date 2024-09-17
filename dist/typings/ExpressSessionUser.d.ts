declare module 'express-session' {
  interface SessionData {
    // Not being treated as required property!
    user: Partial<
      import('../app/server/modules/account-manager.js').AccountInfo
    >
  }
}

export {};
