describe('Signup', function () {
  beforeEach(() => {
    cy.task('deleteAllAccounts');
  });
  // https://www.npmjs.com/package/cypress-axe
  it('Signup has no detectable a11y violations on load', () => {
    cy.visitURLAndCheckAccessibility('/signup');
  });
  it('Visit Signup and submit', function () {
    cy.task('deleteEmails');
    // eslint-disable-next-line promise/prefer-await-to-then
    return cy.task('hackEnv').then(({
      NL_EMAIL_USER,
      NL_EMAIL_PASS
    }) => {
      cy.visit('/signup');
      cy.get('[data-name="name"]').type('Brett');
      cy.get('[data-name="email"]').type(NL_EMAIL_USER);
      cy.get('[data-name="country"]').select('US');
      cy.get('[data-name="user"]').type('bretto');
      cy.get('[data-name="pass"]').type(NL_EMAIL_PASS);
      cy.get('[data-name="pass-confirm"]').type(NL_EMAIL_PASS);
      cy.get('[data-name=account-form] [data-name=action2]').click();
      cy.get('[data-name=modal-alert] [data-name=ok]').click({
        timeout: 20000
      });
      cy.location('pathname', {
        timeout: 10000
      }).should('eq', '/');

      // We don't know exactly how long until the email will be delivered
      // // eslint-disable-next-line cypress/no-unnecessary-waiting
      // cy.wait(15000);

      // Check that received activation email
      // eslint-disable-next-line promise/no-nesting
      return cy.task('hasEmail', {
        subject: 'Account Activation',
        html: [
          'Please click here to activate your account',
          '<a href=',
          'activation?c='
        ]
        // eslint-disable-next-line promise/prefer-await-to-then
      }, {timeout: 30000}).then((hasEmail) => {
        // Todo: In full UI version, we could look for the link and visit it.
        return expect(hasEmail).to.be.true;
      // eslint-disable-next-line promise/prefer-await-to-then
      }).then(() => {
        return cy.task('getRecords', {user: ['bretto']});
      // eslint-disable-next-line promise/prefer-await-to-then
      }).then((accts) => {
        const {user, activated} = accts[0];
        expect(user).to.equal('bretto');
        expect(activated).to.be.false;
        return cy.log(accts);
      });
    });
  });
});
