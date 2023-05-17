import alert from './modals/alert.js';
import resetPasswordModal from './modals/reset-password.js';

/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback
 * }} cfg
 */
const resetPassword = ({_, layout}) => {
  return layout({
    content: /** @type {import('jamilih').JamilihChildren} */ ([
      resetPasswordModal({_}),
      alert({_})
    ]),
    scripts: [
      ['script', {
        src: '/js/controllers/resetPasswordController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

export default resetPassword;
