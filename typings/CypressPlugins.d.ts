declare namespace Cypress {
  interface Chainable {
    login(cfg?: {
      user: string,
      ip: string,
      secure: boolean,
      badSecret?: string
    }): Chainable
    clearAndType(sel: string, content: string): Chainable
    visitURLAndCheckAccessibility(url: string, CypressVisitOptions?: object): void
    loginWithSession(cfg?: {nondefaultEmail?: boolean}): void
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
  }
}
