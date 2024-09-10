import alert from './modals/alert.js';
import lostPassword from './modals/lost-password.js';

/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback,
 *   emailPattern: string,
 *   signup: string
 * }} cfg
 */
const login = ({_, layout, emailPattern, signup}) => {
  return layout({
    content: /** @type {import('jamilih').JamilihChildren} */ ([
      ['div', {
        id: 'login', class: 'center-vertical', role: 'main',
        'data-name': 'login'
      }, [
        ['form', {class: 'card card-body bg-light', method: 'post'}, [
          ['h1', {class: 'dialog'}, [_('Hello')]],
          ['h2', {class: 'dialog'}, [_('PleaseLoginToYourAccount')]],
          ['div', {class: 'form-group'}, [
            ['label', {for: 'user-tf'}, [_('Username')]],
            ['input', {
              autocomplete: 'username',
              required: 'required',
              class: 'form-control', type: 'text',
              id: 'user-tf',
              'data-name': 'user',
              name: 'user'
            }]
          ]],
          ['div', {class: 'form-group'}, [
            ['label', {for: 'pass-tf'}, [_('Password')]],
            ['input', {
              autocomplete: 'current-password',
              type: 'password',
              required: 'required',
              class: 'form-control', id: 'pass-tf', 'data-name': 'pass',
              name: 'pass'
            }]
          ]],
          ['div', {id: 'row1'}, [
            ['button', {
              type: 'button',
              id: 'btn_remember', class: 'remember-me btn btn-light btn-left',
              'data-name': 'btn_remember'
            }, [
              ['span', {class: 'fa fa-solid fa-square-check'}],
              _('RememberMe')
            ]],
            ['button', {
              type: 'submit',
              id: 'btn_sign_in',
              'data-name': 'btn_sign_in',
              class: 'btn btn-primary'
            }, [
              ['span', {class: 'fa fa-lock'}, [_('SignIn')]]
            ]]
          ]],
          ['hr'],
          ['div', {class: 'btm-links'}, [
            ['div', {
              id: 'forgot-password',
              'data-name': 'forgot-password'
            }, [
              ['a', {href: '#'}, [_('ForgotYourPassword')]]
            ]],
            ['div', {id: 'create-account'}, [
              ['a', {href: signup}, [_('CreateAnAccount')]]
            ]]
          ]],
          alert({_})
        ]]
      ]],
      lostPassword({_, emailPattern})
    ]),
    scripts: [
      ['script', {
        src: '/js/controllers/loginController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

export default login;
