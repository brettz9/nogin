describe('Lang', function () {
  it('Get lang', function () {
    cy.request('/lang').its('body').should(
      'include',
      'window._ = IntlDom.i18nServer('
    );
  });
});
