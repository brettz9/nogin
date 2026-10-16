/**
 * @param {{
 *   _: import('intl-dom').I18NCallback,
 *   layout: import('../routeUtils.js').LayoutCallback,
 *   receiptText: string,
 *   plansPath: string
 * }} cfg
 */
const purchased = ({_, layout, receiptText, plansPath}) => {
  return layout({
    content: [
      ['div', {role: 'main'}, [
        ['h1', [_('PurchaseThanks')]],
        ['p', [_('PurchaseThanksBody')]],
        receiptText ? ['p', {class: 'receipt'}, [receiptText]] : '',
        ['p', [['a', {href: plansPath}, [_('PlanBackToPlans')]]]]
      ]]
    ]
  });
};

export default purchased;
