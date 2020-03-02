describe('Signup', function () {
  beforeEach(() => {
    cy.task('deleteAllAccounts');
  });
  // https://www.npmjs.com/package/cypress-axe
  it('Signup has no detectable a11y violations on load', () => {
    cy.visitURLAndCheckAccessibility('/signup');
  });
  it('Visit Signup and submit', function () {
    cy.visit('/signup');
    cy.get('[data-name="name"]').type('Brett');
    cy.get('[data-name="email"]').type('brettz9@example.com');
    cy.get('[data-name="country"]').select('US');
    cy.get('[data-name="user"]').type('bretto');
    cy.get('[data-name="pass"]').type('abc123456');
    cy.get('[data-name="pass-confirm"]').type('abc123456');
    cy.get('[data-name=account-form] [data-name=action2]').click();
    cy.get('[data-name=modal-alert] [data-name=ok]').click({
      timeout: 20000
    });
    cy.location('pathname', {
      timeout: 10000
    }).should('eq', '/');

    // Check that received activation email
    return cy.task('getEmail', {
      subject: '',
      html: []
    // eslint-disable-next-line promise/prefer-await-to-then
    }).then(() => {
      // Todo:
      // Todo: In full UI version, we could look for the link and visit it.
      return true;
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
