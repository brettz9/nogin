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
  cy.injectAxe2();
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

// Workaround for https://github.com/component-driven/cypress-axe/issues/73
Cypress.Commands.add('injectAxe2', () => {
  // eslint-disable-next-line max-len -- Long
  // eslint-disable-next-line promise/catch-or-return, promise/prefer-await-to-then -- Testing
  cy.window({log: false}).then((win) => {
    // eslint-disable-next-line no-undef -- Works despite file being imported
    const axe = require('axe-core/axe.js');
    const script = win.document.createElement('script');
    // eslint-disable-next-line no-unsanitized/property -- Test environment
    script.innerHTML = axe.source;
    win.document.head.append(script);
    return undefined;
  });
});

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

Cypress.Commands.add(
  'login',
  ({
    user, ip,
    secure = false,
    badSecret = null // For testing forging attempts
  } = {}) => {
    return cy.task('generateLoginKey', {
      user, ip, badSecret
      // eslint-disable-next-line promise/prefer-await-to-then
    }).then((key) => {
      // eslint-disable-next-line promise/no-nesting
      return cy.setCookie('login', key, {
        secure
      // eslint-disable-next-line promise/prefer-await-to-then
      }).then(() => {
        return key;
      });
    });
  }
);

Cypress.Commands.add(
  'loginWithSession',
  ({nondefaultEmail} = {}) => {
    const NL_EMAIL_PASS = Cypress.env('NL_EMAIL_PASS');
    cy.task('deleteAllAccounts');
    if (nondefaultEmail) {
      cy.task('addNondefaultAccount');
    } else {
      cy.task('addAccount');
    }
    // Not just login, but get session, so will be shown `/home`
    //   without redirect upon visit
    return cy.request({
      url: '/',
      method: 'POST',
      timeout: 50000,
      body: {
        user: 'bretto',
        pass: NL_EMAIL_PASS
      }
    });
  }
);

Cypress.Commands.add(
  'validUserPassword',
  (cfg) => {
    return cy.task('validUserPassword', cfg);
  }
);

Cypress.Commands.add(
  'simulateServerError',
  (cfg) => {
    // We first trigger coverage on the server, checking that it
    //  indeed would give the response expected (as HTML doesn't
    //  seem to support a JSON enctype per https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form#attr-enctype
    //  then we simulate it here).
    return cy.request({
      method: 'POST',
      timeout: 50000,
      url: cfg.url,
      // Don't URL-encode; we want non-string JSON to trigger the error
      form: false,
      failOnStatusCode: false,
      body: cfg.body
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then((response) => {
      expect(response.status).to.eq(400);
      expect(response.body).to.contain(
        cfg.error
      );

      // But since the above was not triggered through our HTML form,
      //  we have to stub the server response and retry against it,
      //  in order to see the effect on our client app.

      return cy.intercept({
        method: 'POST',
        url: cfg.routeURL || cfg.url
      }, {
        statusCode: 400,
        body: cfg.error
      });
    });
  }
);
