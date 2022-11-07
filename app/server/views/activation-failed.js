import alert from './modals/alert.js';

const activationFailed = ({_, layout}) => {
  return layout({
    content: [
      ['div', {role: 'main'}, [
        ['h1', [
          _('ActivationFailed')
        ]],
        alert({_})
      ]]
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
