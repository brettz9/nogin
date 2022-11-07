import alert from './modals/alert.js';
import resetPasswordModal from './modals/reset-password.js';

const resetPassword = ({_, layout}) => {
  return layout({
    content: [
      resetPasswordModal({_}),
      alert({_})
    ],
    scripts: [
      ['script', {
        src: '/js/controllers/resetPasswordController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

export default resetPassword;
