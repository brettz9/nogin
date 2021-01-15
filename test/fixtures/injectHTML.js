'use strict';
module.exports = function (cfg) {
  return {
    headPre: [
      ['script', {src: 'headPreContent.js'}]
    ],
    headPost: `<link rel="stylesheet" href="headPostContent.css">`,
    bodyPre: `<link rel="stylesheet" href="bodyPreContent.css">`,
    bodyPost: [
      ['script', {src: 'bodyPostContent.js'}]
    ]
  };
};
