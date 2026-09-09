/* eslint-disable cypress/require-data-selectors -- The groups view
  identifies its controls by semantic class, not `data-*` */

describe('Groups', function () {
  beforeEach(function () {
    cy.task('deleteCustomGroupsAndPrivileges');
  });

  it('Is not found for a logged-out visitor', function () {
    cy.task('deleteAllAccounts');
    cy.visit('/groups', {failOnStatusCode: false});
    cy.get('[data-name=four04]').should('exist');
  });

  it('Renders the full management UI for the root user', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.task('addGroup', {groupName: 'editors'});
    cy.task('addUserToGroup', {groupName: 'editors', userID: 'bretto'});
    cy.task('addPrivilege', {
      privilegeName: 'publish', description: 'May publish'
    });
    cy.task('addPrivilegeToGroup', {
      groupName: 'editors', privilegeName: 'publish'
    });

    cy.visit('/groups');

    cy.get('h1').should('contain', 'Groups');
    cy.get('.createGroup').should('exist');

    // Built-in and custom groups are both listed
    cy.get('.table-bordered').contains('nogin.guests');
    cy.get('.table-bordered').contains('editors');

    // Root sees every per-group action control
    cy.get('.renameGroup').should('exist');
    cy.get('.deleteGroup').should('exist');
    cy.get('.addUserToGroup').should('exist');
    cy.get('.addPrivilegeToGroup').should('exist');

    cy.get('.removePrivilegeFromGroup[data-group=editors]').should(
      'contain', 'publish'
    );
    cy.get(
      '.removeUserFromGroup[data-user=bretto][data-group=editors]'
    ).should('contain', 'bretto');
  });

  it(
    'Renders read-only for a non-root user holding only `nogin.readGroup`',
    function () {
      cy.loginWithSession();
      cy.task('addGroup', {groupName: 'readers'});
      cy.task('addUserToGroup', {groupName: 'readers', userID: 'bretto'});
      cy.task('addPrivilegeToGroup', {
        groupName: 'readers', privilegeName: 'nogin.readGroup'
      });

      cy.visit('/groups');

      cy.get('h1').should('contain', 'Groups');
      cy.get('.table-bordered').contains('readers');

      // No per-group controls, and the privileges/users columns are
      //   dropped entirely (the always-present `createGroup` button is
      //   not access-gated by the view)
      cy.get('.renameGroup').should('not.exist');
      cy.get('.deleteGroup').should('not.exist');
      cy.get('.addUserToGroup').should('not.exist');
      cy.get('.addPrivilegeToGroup').should('not.exist');
      cy.get('.removeUserFromGroup').should('not.exist');
      cy.get('.removePrivilegeFromGroup').should('not.exist');
      cy.get('th.privileges').should('not.exist');
      cy.get('th.users').should('not.exist');
    }
  );

  it(
    'Shows the privileges column read-only with `+ nogin.readPrivilege`',
    function () {
      cy.loginWithSession();
      cy.task('addGroup', {groupName: 'readers'});
      cy.task('addUserToGroup', {groupName: 'readers', userID: 'bretto'});
      cy.task('addPrivilegeToGroup', {
        groupName: 'readers', privilegeName: 'nogin.readGroup'
      });
      cy.task('addPrivilegeToGroup', {
        groupName: 'readers', privilegeName: 'nogin.readPrivilege'
      });

      cy.visit('/groups');

      cy.contains('.table-bordered tr', 'readers').should(
        'contain', 'nogin.readGroup'
      );
      cy.get('.removePrivilegeFromGroup').should('not.exist');
      cy.get('.renameGroup').should('not.exist');
    }
  );

  it(
    'Shows the users column read-only with `+ nogin.readUsers`',
    function () {
      cy.loginWithSession();
      cy.task('addGroup', {groupName: 'readers'});
      cy.task('addUserToGroup', {groupName: 'readers', userID: 'bretto'});
      cy.task('addPrivilegeToGroup', {
        groupName: 'readers', privilegeName: 'nogin.readGroup'
      });
      cy.task('addPrivilegeToGroup', {
        groupName: 'readers', privilegeName: 'nogin.readUsers'
      });

      cy.visit('/groups');

      cy.contains('.table-bordered tr', 'readers').should('contain', 'bretto');
      cy.get('.removeUserFromGroup').should('not.exist');
      cy.get('.renameGroup').should('not.exist');
    }
  );

  it(
    'Tolerates a group member whose account has been deleted',
    function () {
      cy.loginWithSession({rootUser: true});
      cy.task('addAccount');
      cy.task('addGroup', {groupName: 'team'});
      cy.task('addUserToGroup', {groupName: 'team', userID: 'bretto'});
      // Drops the account but leaves the stale id in `team.userIDs`
      cy.task('deleteAllAccountsExceptRoot');

      cy.visit('/groups');

      cy.get('h1').should('contain', 'Groups');
      cy.get('.table-bordered').contains('team');
    }
  );

  it('Has no detectable a11y violations for the root user', function () {
    cy.loginWithSession({rootUser: true});
    cy.visitURLAndCheckAccessibility('/groups');
  });
});
