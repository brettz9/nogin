import {getOfferFormatters} from './offerFormat.js';

/**
 * @typedef {import('jamilih').JamilihChildren} JamilihChildren
 */

/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback,
 *   offersInfo: import('../modules/offer-manager.js').OfferInfo[],
 *   loggedIn: boolean,
 *   paymentsConfigured: boolean,
 *   canManage: boolean,
 *   loginPath: string
 * }} cfg
 */
const plans = ({
  _, layout, offersInfo, loggedIn, paymentsConfigured, canManage, loginPath
}) => {
  const {formatPrice, formatBilling} = getOfferFormatters(_);

  /**
   * @param {import('../modules/offer-manager.js').OfferInfo} offer
   * @returns {JamilihChildren[number]}
   */
  const action = ({slug}) => {
    if (!paymentsConfigured) {
      return ['p', [_('PlanUnavailable')]];
    }
    return loggedIn
      ? ['button', {
        class: 'buyOffer btn btn-primary', 'data-slug': slug
      }, [_('PlanBuy')]]
      : ['a', {class: 'btn btn-primary', href: loginPath}, [
        _('PlanLoginToBuy')
      ]];
  };

  return layout({
    content: [
      ['div', {role: 'main'}, /** @type {JamilihChildren} */ ([
        ['h1', [_('Plans')]],
        offersInfo.length ? '' : ['p', [_('PlanNoOffers')]],
        ...offersInfo.map((offer) => {
          return ['section', {class: 'plan', 'data-slug': offer.slug}, [
            ['h2', [offer.name]],
            ['p', {class: 'price'}, [
              formatPrice(offer), ' ', ['small', [formatBilling(offer)]]
            ]],
            ['p', {class: 'description'}, [offer.description]],
            action(offer)
          ]];
        }),
        canManage
          ? ['p', [
            ['button', {class: 'manageSubscription btn btn-secondary'}, [
              _('ManageSubscription')
            ]]
          ]]
          : '',
        ['p', {
          id: 'planError', class: 'text-danger', role: 'alert'
        }]
      ])]
    ],
    scripts: loggedIn
      ? [['script', {
        src: '/js/controllers/plansController.iife.min.js',
        defer: 'defer'
      }]]
      : []
  });
};

export default plans;
