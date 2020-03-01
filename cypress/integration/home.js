describe('Home', function () {
  it(
    'Visit Home and be redirected when no session (no post to `/`, ' +
    '`/home` or GET to auto-login at `/` (from previous-set cookie ' +
    'posting to `/`)).',
    function () {
      cy.visit('/home');
      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');
    }
  );
  it('Visit Home after login', function () {
    // See `hackEnv` on how apparently not working and why we need this hack
    // const secure = Cypress.env('env') === 'production'
    let secure;
    // eslint-disable-next-line max-len
    // eslint-disable-next-line promise/catch-or-return, promise/prefer-await-to-then
    cy.task('hackEnv', 'env').then((env) => {
      cy.log(env);
      secure = env === 'production';
      return cy.login({
        user: 'bretto',
        // ipv6 read by Express
        ip: '::ffff:127.0.0.1',
        secure
      });
    // Cypress won't run the tests with an `await` here
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then((key) => {
      cy.visit('/home');

      const expressSessionID = 'connect.sid';
      cy.getCookie(expressSessionID).should('exist');

      cy.getCookie('login').should('have.property', 'value', key);
      cy.getCookie('login').should('have.property', 'secure', secure);

      return cy.get('[data-name="navbar-brand"]', {
        timeout: 10000
      }).contains('Control Panel');

      // Todo[>=1.7.0]: Check good and bad delete

    // eslint-disable-next-line promise/prefer-await-to-then
    }).then(() => {
      // Home after login has no detectable a11y violations on load
      return cy.visitURLAndCheckAccessibility('/home');
    });
  });
  // https://www.npmjs.com/package/cypress-axe
});
