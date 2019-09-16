const a = 5;
const b = 6;

console.log(a, b);

const getVal = () => {
  return a;
};

// eslint-disable-next-line node/no-unsupported-features/es-syntax
export default getVal;
