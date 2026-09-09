/* eslint-disable cypress/require-data-selectors -- The privileges view
  identifies its controls by semantic class, not `data-*` */

describe('Privileges', function () {
  beforeEach(function () {
    cy.task('deleteCustomGroupsAndPrivileges');
  });

  it('Is not found for a logged-out visitor', function () {
    cy.task('deleteAllAccounts');
    cy.visit('/privileges', {failOnStatusCode: false});
    cy.get('[data-name=four04]').should('exist');
  });

  it('Renders the full management UI for the root user', function () {
    cy.loginWithSession({rootUser: true});
    cy.task('addAccount');
    cy.task('addGroup', {groupName: 'editors'});
    cy.task('addPrivilege', {
      privilegeName: 'publish', description: 'May publish'
    });
    cy.task('addPrivilege', {
      privilegeName: 'betaFlag', description: 'Beta tester', userVarying: true
    });
    cy.task('addPrivilegeToGroup', {
      groupName: 'editors', privilegeName: 'publish'
    });
    cy.task('addPrivilegeToUser', {
      userID: 'bretto', privilegeName: 'betaFlag'
    });

    cy.visit('/privileges');

    cy.get('h1').should('contain', 'Privileges');
    cy.get('.createPrivilege').should('exist');

    // Built-in and custom privileges are both listed
    cy.get('.table-bordered').contains('nogin.readPrivilege');
    cy.get('.table-bordered').contains('publish');
    cy.get('.table-bordered').contains('betaFlag');

    // Root sees every action column
    cy.get('.editPrivilege').should('exist');
    cy.get('.deletePrivilege').should('exist');
    cy.get('.addPrivilegeToGroup').should('exist');
    cy.get('.addPrivilegeToUser').should('exist');

    // A privilege assigned to a group shows a remove-from-group control
    cy.get('.removePrivilegeFromGroup[data-group=editors]').should(
      'contain', 'editors'
    );

    // A user-varying privilege assigned to a user shows the user and a
    //   remove-from-user control
    cy.get('.removePrivilegeFromUser[data-user=bretto]').should(
      'contain', 'bretto'
    );
  });

  it(
    'Renders read-only for a non-root user holding only `nogin.readPrivilege`',
    function () {
      cy.loginWithSession();
      cy.task('addGroup', {groupName: 'readers'});
      cy.task('addUserToGroup', {groupName: 'readers', userID: 'bretto'});
      cy.task('addPrivilegeToGroup', {
        groupName: 'readers', privilegeName: 'nogin.readPrivilege'
      });

      cy.visit('/privileges');

      cy.get('h1').should('contain', 'Privileges');
      cy.get('.table-bordered').contains('nogin.editPrivilege');

      // No management columns/controls without the corresponding
      //   privileges (the always-present `createPrivilege` button is not
      //   access-gated by the view)
      cy.get('.editPrivilege').should('not.exist');
      cy.get('.deletePrivilege').should('not.exist');
      cy.get('.addPrivilegeToGroup').should('not.exist');
      cy.get('.removePrivilegeFromGroup').should('not.exist');
      cy.get('.addPrivilegeToUser').should('not.exist');
    }
  );

  it(
    'Shows the group column for a reader who also holds `nogin.readGroup`',
    function () {
      cy.loginWithSession();
      cy.task('addGroup', {groupName: 'readers'});
      cy.task('addUserToGroup', {groupName: 'readers', userID: 'bretto'});
      cy.task('addPrivilegeToGroup', {
        groupName: 'readers', privilegeName: 'nogin.readPrivilege'
      });
      cy.task('addPrivilegeToGroup', {
        groupName: 'readers', privilegeName: 'nogin.readGroup'
      });
      cy.task('addPrivilege', {
        privilegeName: 'betaFlag', description: 'Beta tester', userVarying: true
      });

      cy.visit('/privileges');

      // `nogin.readPrivilege` is assigned to the `readers` group, so the
      //   read-only group column names it
      cy.contains('.table-bordered tr', 'nogin.readPrivilege').should(
        'contain', 'readers'
      );
      // A user-varying privilege is `N/A` in the group column
      cy.contains('.table-bordered tr', 'betaFlag').should('contain', 'N/A');
      // Still no editing controls
      cy.get('.removePrivilegeFromGroup').should('not.exist');
      cy.get('.editPrivilege').should('not.exist');
    }
  );

  it(
    'Lists users read-only for a reader who also holds `nogin.readUsers`',
    function () {
      cy.loginWithSession();
      cy.task('addGroup', {groupName: 'readers'});
      cy.task('addUserToGroup', {groupName: 'readers', userID: 'bretto'});
      cy.task('addPrivilegeToGroup', {
        groupName: 'readers', privilegeName: 'nogin.readPrivilege'
      });
      cy.task('addPrivilegeToGroup', {
        groupName: 'readers', privilegeName: 'nogin.readUsers'
      });
      cy.task('addPrivilege', {
        privilegeName: 'betaFlag', description: 'Beta tester', userVarying: true
      });
      cy.task('addPrivilegeToUser', {
        userID: 'bretto', privilegeName: 'betaFlag'
      });

      cy.visit('/privileges');

      cy.get('h1').should('contain', 'Privileges');
      // The user-varying privilege names its user, without a remove control
      cy.contains('.table-bordered tr', 'betaFlag').should('contain', 'bretto');
      cy.get('.removePrivilegeFromUser').should('not.exist');
      cy.get('.addPrivilegeToUser').should('not.exist');
      // A non-user-varying privilege is `N/A` in the users column
      cy.contains('.table-bordered tr', 'nogin.editPrivilege').should(
        'contain', 'N/A'
      );
      cy.get('.editPrivilege').should('not.exist');
    }
  );

  it(
    'Renders the management controls for a non-root user granted them',
    function () {
      cy.loginWithSession();
      cy.task('addGroup', {groupName: 'staff'});
      cy.task('addUserToGroup', {groupName: 'staff', userID: 'bretto'});
      for (const privilegeName of [
        'nogin.readPrivilege', 'nogin.editPrivilege',
        'nogin.addPrivilegeToGroup', 'nogin.removePrivilegeFromGroup',
        'nogin.readGroup', 'nogin.readUsers'
      ]) {
        cy.task('addPrivilegeToGroup', {groupName: 'staff', privilegeName});
      }
      cy.task('addGroup', {groupName: 'editors'});
      cy.task('addPrivilege', {privilegeName: 'publish', description: 'x'});
      cy.task('addPrivilegeToGroup', {
        groupName: 'editors', privilegeName: 'publish'
      });
      cy.task('addPrivilege', {
        privilegeName: 'betaFlag', description: 'x', userVarying: true
      });
      cy.task('addPrivilegeToUser', {
        userID: 'bretto', privilegeName: 'betaFlag'
      });

      cy.visit('/privileges');

      // The action columns are driven by `getUserPrivs`, not just root
      cy.get('.editPrivilege').should('exist');
      cy.get('.deletePrivilege').should('exist');
      cy.get('.addPrivilegeToGroup').should('exist');
      // Group and user data are kept (no stripping branch taken)
      cy.get('.removePrivilegeFromGroup[data-group=editors]').should(
        'contain', 'publish'
      );
      cy.contains('.table-bordered tr', 'betaFlag').should('contain', 'bretto');
    }
  );

  it(
    'Tolerates a group member whose account has been deleted',
    function () {
      cy.loginWithSession({rootUser: true});
      cy.task('addAccount');
      cy.task('addGroup', {groupName: 'team'});
      cy.task('addUserToGroup', {groupName: 'team', userID: 'bretto'});
      cy.task('addPrivilege', {privilegeName: 'publish', description: 'x'});
      cy.task('addPrivilegeToGroup', {
        groupName: 'team', privilegeName: 'publish'
      });
      // Drops the account but leaves the stale id in `team.userIDs`
      cy.task('deleteAllAccountsExceptRoot');

      cy.visit('/privileges');

      cy.get('h1').should('contain', 'Privileges');
      cy.contains('.table-bordered tr', 'publish').should('contain', 'team');
    }
  );

  it('Has no detectable a11y violations for the root user', function () {
    cy.loginWithSession({rootUser: true});
    cy.visitURLAndCheckAccessibility('/privileges');
  });
});
