import alert from './modals/alert.js';

const activated = ({_, layout}) => {
  return layout({
    content: [
      ['div', {role: 'main'}, [
        ['h1', [
          _('Activation')
        ]],
        alert({_})
      ]]
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
