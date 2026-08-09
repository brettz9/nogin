declare namespace Cypress {
  interface Chainable<Subject = any> {
    login(cfg?: {
      user: string,
      ip: string,
      secure: boolean,
      badSecret?: string
    }): Chainable<string>
    clearAndType(sel: string, content: string): Chainable<Subject>
    clearTypeAndBlur(sel: string, content: string): Chainable<Subject>
    visitURLAndCheckAccessibility(url: string, CypressVisitOptions?: object): void
    loginWithSession(cfg?: {nondefaultEmail?: boolean, rootUser?: boolean}): void
    validUserPassword(cfg: {
      user: string,
      pass: string
    }): void
    getToken(url?: string): Chainable<string>
    simulateServerError(cfg: {
      noToken?: boolean
      times?: number
      tokenURL?: string
      routeURL?: string
      url: string
      body: any,
      error: any
    }): Chainable<null>
    then(fn: (this: any, currentSubject: any) => any): Chainable<any>
  }
}
