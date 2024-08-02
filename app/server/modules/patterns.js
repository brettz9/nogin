const nonSpecialChars = String.raw`[^<>()[\]\\.,;:\s@"]+`;
const ipv4Address = String.raw`\[\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\]`;

const emailPattern = '^(' +
  '(' +
    // 1+ initial chars. excluding special chars.
    nonSpecialChars +
    // (Optional) dot followed by 1+ chars., excluding
    //   any special chars.
    String.raw`(\.` + nonSpecialChars + ')*' +
  ')|' +
  // Or quoted value
  '(".+")' +
')@(' +
  '(' +
    ipv4Address +
  ')|' +
  '(' +
    // 1+ sequences of:
    //    1+ alphanumeric (or hyphen) followed by dot
    // ...followed by 2+ alphabetic characters
    String.raw`([a-zA-Z\-\d]+\.)+[a-zA-Z]{2,}` +
  ')' +
')$';

export {emailPattern};
