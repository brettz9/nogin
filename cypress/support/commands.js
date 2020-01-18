// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add(
//   "drag", { prevSubject: 'element'}, (subject, options) => { ... }
// )
//
//
// -- This is a dual command --
// Cypress.Commands.add(
//  "dismiss", { prevSubject: 'optional'}, (subject, options) => { ... }
// )
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/**
* @external CypressVisitOptions
* @see https://docs.cypress.io/api/commands/visit.html
*/

/**
 * @returns {void}
 */
function checkAccessibility () {
  cy.injectAxe();
  // Configure aXe and test the page at initial load
  cy.configureAxe({
    // Todo: Reenable this accessibility rule when have time to fix
    // See https://www.deque.com/axe/axe-for-web/documentation/api-documentation/#user-content-parameters-1
    // For Bootstrap's lack of built-in color contrast, see
    //  https://getbootstrap.com/docs/4.0/getting-started/accessibility/#color-contrast
    rules: [{
      id: 'color-contrast',
      enabled: false
    }]
    /*
    branding: {
      brand: String,
      application: String
    },
    reporter: 'option',
    checks: [Object],
    rules: [Object],
    locale: Object
    */
  });
  cy.checkA11y();
}

// Not currently in use, but can use to only
//  apply accessibility after visiting a page and
//  waiting for some condition
Cypress.Commands.add(
  'checkAccessibility',
  checkAccessibility
);

Cypress.Commands.add(
  'visitURLAndCheckAccessibility',
  /**
   * @param {string} url
   * @param {external:CypressVisitOptions} options
   * @returns {void}
   */
  (url, options) => {
    cy.visit(url, options);
    checkAccessibility();
  }
);
