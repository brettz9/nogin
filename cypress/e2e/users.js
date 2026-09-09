describe('Users', function () {
  describe('as the root user', function () {
    /**
     * @param {string} text
     * @returns {Cypress.Chainable}
     */
    const expectAlert = (text) => {
      return cy.get(
        '[data-name=modal-alert] [data-name=modal-body] p',
        {timeout: 20000}
      ).should('contain', text);
    };

    beforeEach(function () {
      // Log in as the root user. The server ends any session whose
      //   account has been deleted, so these tests clear the user list
      //   with `deleteAllAccountsExceptRoot` to keep the root account
      //   (and thus the session) alive.
      cy.loginWithSession({rootUser: true});
    });

    it('Visit Users (Empty)', function () {
      cy.task('deleteAllAccountsExceptRoot');
      cy.visit('/users');
      cy.get('[data-name=users] tbody tr').should('have.length', 1);
    });

    it('Visit Users (With user)', function () {
      cy.task('deleteAllAccountsExceptRoot');
      cy.task('addAccount');
      cy.task('addNonActivatedAccount');
      cy.task('addAccountWithMissingNameAndCountry');
      cy.visit('/users');

      cy.get('[data-name=users] tbody tr').should('have.length', 4);

      cy.get('[data-name=users] tbody tr').eq(0).should(($row) => {
        const text = $row.text();
        expect(text).to.match(/1/v);
        expect(text).to.match(/Root/v);
        expect(text).to.match(/nogin1/v);
        expect(text).to.match(/United States/v);
      });

      cy.get('[data-name=users] tbody tr').eq(1).should(($row) => {
        const text = $row.text();
        expect(text).to.match(/2/v);
        expect(text).to.match(/Brett/v);
        expect(text).to.match(/bretto/v);
        expect(text).to.match(/United States/v);
        expect(text).to.match(/\w+, \w+ \d{1,2}, \d{4}/v);
      });

      cy.get('[data-name=users] tbody tr').eq(2).should(($row) => {
        const text = $row.text();
        expect(text).to.match(/3/v);
        expect(text).to.match(/Nicole/v);
        expect(text).to.match(/nicky/v);
        expect(text).to.match(/Iran/v);
        expect(text).to.match(/\w+, \w+ \d{1,2}, \d{4}/v);
      });

      cy.get('[data-name=users] tbody tr').eq(3).should(($row) => {
        const text = $row.text();
        expect(text).to.match(/4/v);
        expect(text).to.match(/Joe/v);
        expect(text).to.match(/\w+, \w+ \d{1,2}, \d{4}/v);
        expect(text).to.not.match(/Brett/v);
        expect(text).to.not.match(/Nicole/v);
      });
    });

    it('deletes a selected user through the confirmation dialog', function () {
      cy.task('deleteAllAccountsExceptRoot');
      cy.task('addAccount');
      cy.visit('/users');

      cy.get('[data-user=bretto]').click();
      cy.get('[data-confirm-type="deleteAccount"] .btn-danger').click();
      expectAlert('bretto account has been deleted');
      cy.get('[data-name=modal-alert] button').click();

      cy.get('[data-name=users] tbody', {timeout: 15000}).should(
        'not.contain', 'bretto'
      );
    });

    it('shows an error when deleting a selected user fails', function () {
      cy.task('deleteAllAccountsExceptRoot');
      cy.task('addAccount');
      cy.visit('/users');
      cy.intercept('POST', '/delete', {
        statusCode: 400,
        body: 'Unable to delete account'
      }).as('deleteAccount');

      cy.get('[data-user=bretto]').click();
      cy.get('[data-confirm-type="deleteAccount"] .btn-danger').click();
      cy.wait('@deleteAccount');
      expectAlert('Unable to delete account');
      cy.task('getRecords', {user: ['bretto']}).should('have.length', 1);
    });

    it('deletes all accounts and returns to the login page', function () {
      cy.task('deleteAllAccountsExceptRoot');
      cy.task('addAccount');
      cy.visit('/users');

      cy.contains('button', 'Delete all accounts').click();
      cy.get('[data-confirm-type="deleteAllAccounts"] .btn-danger').click();
      expectAlert('All user accounts were deleted');
      cy.get('[data-name=modal-alert] button').click();

      cy.location('pathname', {timeout: 15000}).should('eq', '/');
      cy.get('[data-name=login]').should('exist');
    });

    // https://www.npmjs.com/package/cypress-axe
    it('users has no detectable a11y violations on load (no users)', () => {
      cy.task('deleteAllAccountsExceptRoot');
      cy.visitURLAndCheckAccessibility('/users');
    });

    it('users has no detectable a11y violations on load', () => {
      cy.task('deleteAllAccountsExceptRoot');
      cy.task('addAccount');
      cy.task('addNonActivatedAccount');
      cy.visitURLAndCheckAccessibility('/users');
    });
  });

  describe('with limited access', function () {
    /* eslint-disable cypress/require-data-selectors -- The users view
      identifies these controls/columns by semantic class */
    beforeEach(function () {
      cy.task('deleteCustomGroupsAndPrivileges');
    });

    /**
     * Logs in as `bretto`, adds a second (group-less) account, and grants
     * `bretto` the named privileges via a group.
     * @param {...string} privilegeNames
     * @returns {void}
     */
    const grantViaGroup = (...privilegeNames) => {
      cy.loginWithSession();
      cy.task('addAccountWithMissingNameAndCountry');
      cy.task('addGroup', {groupName: 'grp'});
      cy.task('addUserToGroup', {groupName: 'grp', userID: 'bretto'});
      for (const privilegeName of privilegeNames) {
        cy.task('addPrivilegeToGroup', {groupName: 'grp', privilegeName});
      }
    };

    it('Is not found for a logged-out visitor', function () {
      cy.task('deleteAllAccounts');
      cy.visit('/users', {failOnStatusCode: false});
      cy.get('[data-name=four04]').should('exist');
    });

    it('`nogin.readUsers` alone: no group or delete columns', function () {
      grantViaGroup('nogin.readUsers');

      cy.visit('/users');

      cy.get('h1').should('contain', 'Users');
      cy.get('[data-name=users] tbody tr').should('have.length', 2);
      cy.get('th.group').should('not.exist');
      cy.get('.deleteAccount').should('not.exist');
      cy.get('.deleteAllAccounts').should('not.exist');
    });

    it('`+ nogin.readGroup`: group column, no privilege titles', function () {
      grantViaGroup('nogin.readUsers', 'nogin.readGroup');

      cy.visit('/users');

      cy.get('th.group').should('exist');
      cy.contains('[data-name=users] tbody tr', 'bretto').should(
        'contain', 'grp'
      );
      cy.contains('[data-name=users] tbody tr', 'Joe').should(
        'contain', '(No group)'
      );
      // Privilege names appear in the group cell `title` only with
      //   `nogin.readPrivilege`
      cy.contains(
        '[data-name=users] tbody tr', 'bretto'
      ).find('td[title]').should('have.attr', 'title', '');
    });

    it('`+ nogin.readPrivilege`: group cell shows privilege names', () => {
      grantViaGroup(
        'nogin.readUsers', 'nogin.readGroup', 'nogin.readPrivilege'
      );

      cy.visit('/users');

      cy.contains(
        '[data-name=users] tbody tr', 'bretto'
      ).find('td[title]').should('have.attr', 'title').and(
        'contain', 'nogin.readUsers'
      );
    });
    /* eslint-enable cypress/require-data-selectors -- end semantic block */
  });
});
