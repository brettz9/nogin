/* eslint-disable node/global-require */
'use strict';

module.exports = function ({
  _, user, countries, emailPattern, requireName, title
}) {
  return [
    // store the `userId` on the client side in a hidden input field
    ['input', {type: 'hidden', id: 'userId', defaultValue: user._id}],

    ['div', {
      id: 'account-form-container', class: 'center-vertical', role: 'form'
    }, [
      ['form', {
        class: 'card card-body bg-light',
        id: 'account-form', 'data-name': 'account-form',
        method: 'post'
      }, [
        ['h1', {class: 'dialog'}, [
          title
        ]],
        ['h2', {class: 'dialog', id: 'sub'}, [_('PleaseTellAboutYourself')]],
        ['hr'],
        ['div', {class: 'form-group row'}, [
          ['label', {
            class: 'col-sm-3 col-form-label col-form-label-sm',
            for: 'name-tf'
          }, [_('Name')]],
          ['div', {class: 'col-sm-9'}, [
            ['input', {
              type: 'text',
              autocomplete: 'name',
              minlength: requireName ? 3 : null,
              class: 'form-control', id: 'name-tf', 'data-name': 'name',
              name: 'name',
              defaultValue: user.name
            }]
          ]]
        ]],
        ['div', {class: 'form-group row'}, [
          ['label', {
            class: 'col-sm-3 col-form-label col-form-label-sm',
            for: 'email-tf'
          }, [_('Email')]],
          ['div', {class: 'col-sm-9'}, [
            ['input', {
              type: 'email',
              required: 'required',
              autocomplete: 'email',
              // Is this more concrete than the built-in validation for
              //   `type=email`?
              pattern: emailPattern,
              class: 'form-control', id: 'email-tf',
              'data-name': 'email',
              name: 'email',
              defaultValue: user.email
            }]
          ]]
        ]],
        ['div', {class: 'form-group row margin-zero'}, [
          ['label', {
            class: 'col-sm-3 col-form-label col-form-label-sm',
            for: 'country-list'
          }, [
            _('Location')
          ]],
          ['div', {class: 'col-sm-9'}, [
            ['select', {
              autocomplete: 'country',
              class: 'custom-select',
              id: 'country-list', name: 'country',
              'data-name': 'country'
            }, [
              ['option', {value: ''}, [
                _('PleaseSelectACountry')
              ]],
              ...countries.map(({code, name}) => {
                return ['option', {
                  value: code, defaultSelected: code === user.country
                }, [name]];
              })
            ]]
          ]]
        ]],
        ['hr'],
        ['div', {class: 'form-group row'}, [
          ['label', {
            for: 'user-tf',
            class: 'col-sm-3 col-form-label col-form-label-sm'
          }, [_('Username')]],
          ['div', {class: 'col-sm-9'}, [
            ['input', {
              required: 'required',
              autocomplete: user.user ? undefined : 'username',
              type: 'text',
              minlength: 3,
              class: 'form-control disabled', id: 'user-tf',
              'data-name': 'user',
              name: 'user',
              defaultValue: user.user
            }]
          ]]
        ]],
        ['div', {class: 'form-group row margin-zero'}, [
          ['label', {
            class: 'col-sm-3 col-form-label col-form-label-sm',
            for: 'pass-tf'
          }, [_('Password')]],
          ['div', {class: 'col-sm-9'}, [
            ['input', {
              required: 'required',
              autocomplete: user.user ? 'current-password' : 'new-password',
              type: 'password',
              minlength: 6,
              class: 'form-control', id: 'pass-tf',
              'data-name': 'pass', name: 'pass', defaultValue: ''
            }]
          ]]
        ]],

        user.user
          ? ''
          : ['div', {class: 'form-group row margin-zero'}, [
            ['label', {
              class: 'col-sm-3 col-form-label col-form-label-sm',
              for: 'pass-confirm-tf'
            }, [_('ConfirmPassword')]],
            ['div', {class: 'col-sm-9'}, [
              ['input', {
                required: 'required',
                autocomplete: 'new-password',
                type: 'password',
                minlength: 6,
                class: 'form-control', id: 'pass-confirm-tf',
                'data-name': 'pass-confirm',
                name: 'pass-confirm', defaultValue: ''
              }]
            ]]
          ]],

        ['hr'],
        ['div', {class: 'form-buttons'}, [
          ['button', {
            type: 'button',
            class: 'action1 btn btn-outline-dark',
            'data-name': 'action1'
          }],
          ['button', {
            type: 'submit', class: 'action2 btn btn-primary',
            'data-name': 'action2'
          }]
        ]]
      ]]
    ]],

    // display form errors in a custom modal window
    require('./modals/form-errors.js')({_})
  ];
};
