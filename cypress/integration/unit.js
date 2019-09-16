// Use to get complete coverage if any guarding code not actually
//   reachable via UI; have server-side do too?;

// eslint-disable-next-line node/no-unsupported-features/es-syntax
import getVal from '../../app/public/js/views/bogus.js';

console.log('getVal', getVal);

describe('Unit testing', function () {
  it('Testing', function () {
    expect(getVal()).to.equal(5);
  });
});
