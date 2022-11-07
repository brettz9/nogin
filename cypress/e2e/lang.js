
describe('Lang', function () {
  it('Has expected contents', function () {
    return cy.request('/_lang').its('body').should(
      'include',
      '_: IntlDom.i18nServer('
    );
  });
  it('Lints properly', function () {
    // eslint-disable-next-line promise/prefer-await-to-then
    return cy.request('/_lang').then(({body: text}) => {
      cy.log(text);
      return cy.task('lint', text);
      // eslint-disable-next-line promise/prefer-await-to-then
    }).then((messages) => {
      return expect(messages).to.be.empty;
    });
  });
});
