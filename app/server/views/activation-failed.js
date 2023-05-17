import alert from './modals/alert.js';

/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   layout: import('../routeUtils.js').LayoutCallback
* }} cfg
*/
const activationFailed = ({_, layout}) => {
  return layout({
    content: [
      ['div', {
        role: 'main'
      }, /** @type {import('jamilih').JamilihChildren} */ ([
        ['h1', [
          _('ActivationFailed')
        ]],
        alert({_})
      ])]
    ],
    scripts: [
      ['script', {
        src: '/js/controllers/activationFailedController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

export default activationFailed;
