/**
 * @typedef {import('jamilih').JamilihChildren} JamilihChildren
 */

import {
  units, billingKeys, capitalize, getOfferFormatters
} from './offerFormat.js';

/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback
 *   hasEditOffersAccess: boolean,
 *   paymentsConfigured: boolean,
 *   offersInfo: import('../modules/offer-manager.js').OfferInfo[],
 *   privileges: {
 *     privilegeName: string,
 *     type: import('../modules/account-manager.js').PrivilegeType,
 *     description: string
 *   }[],
 *   groups: string[]
 * }} cfg
 */
const offers = ({
  _, layout, hasEditOffersAccess, paymentsConfigured, offersInfo,
  privileges, groups
}) => {
  const {formatPrice, formatBilling} = getOfferFormatters(_);

  return layout({
    content: [
      ['div', {
        class: 'offers-page', role: 'main'
      }, /** @type {JamilihChildren} */ ([
        ['h1', [_('Offers')]],
        paymentsConfigured
          ? ''
          : ['p', {class: 'alert alert-warning'}, [
            _('OfferStripeNotConfigured')
          ]],
        ['table', {class: 'table table-bordered table-striped'}, [
          ['thead', {class: 'thead-dark'}, [
            ['tr', [
              ['th', [_('Name')]],
              ['th', [_('OfferSlug')]],
              ['th', [_('OfferPrice')]],
              ['th', [_('OfferBilling')]],
              ['th', [_('OfferGrants')]],
              ['th', [_('OfferStatus')]],
              hasEditOffersAccess ? ['th', [_('editOffer')]] : '',
              hasEditOffersAccess ? ['th', [_('archiveOffer')]] : ''
            ]]
          ]],
          ['tbody', /** @type {JamilihChildren} */ (
            offersInfo.map((offer) => {
              return ['tr', {class: 'offer', 'data-slug': offer.slug}, [
                ['td', [offer.name]],
                ['td', [offer.slug]],
                ['td', [formatPrice(offer)]],
                ['td', [formatBilling(offer)]],
                ['td', [[
                  ...offer.privilegeIDs.map((assignment) => {
                    return typeof assignment === 'string'
                      ? assignment
                      : assignment.privilegeName;
                  }),
                  ...offer.groupNames
                ].join(', ')]],
                ['td', [_(offer.active ? 'OfferActive' : 'OfferArchived')]],
                hasEditOffersAccess
                  ? ['td', [
                    ['button', {
                      class: 'editOffer btn btn-secondary',
                      'data-offer': JSON.stringify(offer)
                    }, ['e']]
                  ]]
                  : '',
                hasEditOffersAccess
                  ? ['td', [
                    ['button', {
                      class: 'archiveOffer btn btn-secondary',
                      'data-slug': offer.slug,
                      'data-active': String(offer.active)
                    }, [_(offer.active ? 'archiveOffer' : 'restoreOffer')]]
                  ]]
                  : ''
              ]];
            })
          )]
        ]],
        hasEditOffersAccess
          ? ['form', {id: 'offerForm', class: 'offerForm', novalidate: ''}, [
            ['h2', {id: 'offerFormHeading'}, [_('createOffer')]],
            ['p', {class: 'form-text'}, [_('OfferPricingNote')]],
            ['div', {class: 'form-group'}, [
              ['label', {for: 'offerSlug'}, [_('OfferSlug')]],
              ['input', {
                id: 'offerSlug', class: 'form-control', required: 'required',
                pattern: String.raw`[a-z0-9][a-z0-9\-]*`
              }]
            ]],
            ['div', {class: 'form-group'}, [
              ['label', {for: 'offerName'}, [_('Name')]],
              ['input', {
                id: 'offerName', class: 'form-control', required: 'required'
              }]
            ]],
            ['div', {class: 'form-group'}, [
              ['label', {for: 'offerDescription'}, [_('Description')]],
              ['textarea', {
                id: 'offerDescription', class: 'form-control',
                required: 'required'
              }]
            ]],
            ['div', {class: 'form-group'}, [
              ['label', {for: 'offerAmount'}, [_('OfferPrice')]],
              ['input', {
                id: 'offerAmount', class: 'form-control', type: 'number',
                min: '0', step: 'any', required: 'required'
              }]
            ]],
            ['div', {class: 'form-group'}, [
              ['label', {for: 'offerCurrency'}, [_('OfferCurrency')]],
              ['input', {
                id: 'offerCurrency', class: 'form-control', defaultValue: 'usd',
                maxlength: '3', required: 'required'
              }]
            ]],
            ['div', {class: 'form-group'}, [
              ['label', {for: 'offerInterval'}, [_('OfferBilling')]],
              // Recurring (yearly) is the default so that permanent access
              //   is only ever granted by a deliberate choice.
              ['select', {id: 'offerInterval', class: 'form-control'}, [
                ...units.map((unit) => {
                  return ['option', {
                    value: unit,
                    defaultSelected: unit === 'year'
                  }, [_(billingKeys[unit])]];
                }),
                ['option', {value: ''}, [_('BillingOneTime')]]
              ]]
            ]],
            ['div', {class: 'form-group', id: 'offerRecurringFields'}, [
              ['label', {for: 'offerIntervalCount'}, [_('OfferEvery')]],
              ['input', {
                id: 'offerIntervalCount', class: 'form-control',
                type: 'number', min: '1', step: '1', defaultValue: '1'
              }],
              ['label', {for: 'offerGraceUnit'}, [_('OfferGraceUnit')]],
              ['select', {id: 'offerGraceUnit', class: 'form-control'}, [
                ['option', {value: '', defaultSelected: true}, [
                  _('OfferGraceStandard')
                ]],
                ...units.map((unit) => {
                  return ['option', {value: unit}, [
                    _(`Unit${capitalize(unit)}`)
                  ]];
                })
              ]],
              ['label', {for: 'offerGraceCount'}, [_('OfferGraceCount')]],
              ['input', {
                id: 'offerGraceCount', class: 'form-control',
                type: 'number', min: '0', step: '1', defaultValue: '0'
              }],
              ['div', {class: 'form-check'}, [
                ['input', {
                  id: 'offerRevokeOnPartialRefund', type: 'checkbox',
                  class: 'form-check-input'
                }],
                ['label', {
                  for: 'offerRevokeOnPartialRefund',
                  class: 'form-check-label'
                }, [_('OfferRevokeOnPartialRefund')]]
              ]]
            ]],
            ['fieldset', {id: 'offerPrivileges'}, [
              ['legend', [_('OfferPrivileges')]],
              privileges.length
                ? ''
                : ['p', [_('OfferNoPrivileges')]],
              ...privileges.map(({privilegeName, type, description}) => {
                return ['div', {class: 'form-check'}, [
                  ['input', {
                    id: `offerPrivilege-${privilegeName}`,
                    type: 'checkbox', class: 'form-check-input',
                    name: 'offerPrivilege', value: privilegeName,
                    'data-type': type
                  }],
                  ['label', {
                    for: `offerPrivilege-${privilegeName}`,
                    class: 'form-check-label', title: description
                  }, [privilegeName]],
                  type === 'boolean'
                    ? ''
                    : ['input', {
                      id: `offerPrivilegeValue-${privilegeName}`,
                      class: 'form-control',
                      'aria-label': _('OfferPrivilegeValue', {
                        privilege: privilegeName
                      })
                    }]
                ]];
              })
            ]],
            ['fieldset', {id: 'offerGroups'}, [
              ['legend', [_('OfferGroups')]],
              ...groups.map((groupName) => {
                return ['div', {class: 'form-check'}, [
                  ['input', {
                    id: `offerGroup-${groupName}`, type: 'checkbox',
                    class: 'form-check-input', name: 'offerGroup',
                    value: groupName
                  }],
                  ['label', {
                    for: `offerGroup-${groupName}`,
                    class: 'form-check-label'
                  }, [groupName]]
                ]];
              })
            ]],
            ['div', {class: 'form-group'}, [
              ['label', {for: 'offerReceiptText'}, [_('OfferReceiptText')]],
              ['textarea', {id: 'offerReceiptText', class: 'form-control'}]
            ]],
            ['p', {
              id: 'offerError', class: 'text-danger', role: 'alert'
            }],
            ['button', {
              type: 'submit', id: 'saveOffer', class: 'btn btn-primary'
            }, [_('saveOffer')]],
            ' ',
            ['button', {
              type: 'button', id: 'resetOffer', class: 'btn btn-secondary'
            }, [_('Cancel')]]
          ]]
          : ''
      ])]
    ],
    scripts: [
      ['script', {
        src: '/js/controllers/offersController.iife.min.js',
        defer: 'defer'
      }]
    ]
  });
};

export default offers;
