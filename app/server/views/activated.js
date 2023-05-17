import alert from './modals/alert.js';

/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   layout: import('../routeUtils.js').LayoutCallback
* }} cfg
*/
const activated = ({_, layout}) => {
  return layout({
    content: [
      ['div', {
        role: 'main'
      }, /** @type {import('jamilih').JamilihChildren} */ ([
        ['h1', [
          _('Activation')
        ]],
        alert({_})
      ])]
    ],
    scripts: [
      ['script', {
        src: '/js/controllers/activatedController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

export default activated;
