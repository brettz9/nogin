// https://github.com/pugjs/pug-lint#configuration-file
// https://github.com/pugjs/pug-lint/blob/master/docs/rules.md
// To prevent id literals before class literals, filed: https://github.com/pugjs/pug-lint/issues/170
module.exports = {
  disallowClassAttributeWithStaticValue: true,
  disallowDuplicateAttributes: true,
  disallowLegacyMixinCall: true,
  disallowMultipleLineBreaks: true,
  disallowSpaceAfterCodeOperator: true,
  disallowSpacesInsideAttributeBrackets: true,
  disallowTrailingSpaces: true,
  // maximumLineLength: 80, // Disabling for now, as can't handle long attributes like href: https://github.com/pugjs/pug-lint/issues/171
  requireClassLiteralsBeforeAttributes: true,
  requireIdLiteralsBeforeAttributes: true,
  requireLineFeedAtFileEnd: true,
  requireLowerCaseAttributes: true,
  requireLowerCaseTags: true,
  requireSpecificAttributes: [{img: ['alt']}],
  requireStrictEqualityOperators: true,
  validateAttributeQuoteMarks: "'",
  validateAttributeSeparator: {separator: ' ', multiLineSeparator: '\n\t'},
  validateDivTags: true,
  validateExtensions: true,
  validateIndentation: '\t',
  validateLineBreaks: 'LF',
  validateSelfClosingTags: true
};
