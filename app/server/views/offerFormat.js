/**
 * @typedef {import('../modules/offer-manager.js').IntervalUnit} IntervalUnit
 * @typedef {import('../modules/offer-manager.js').OfferInfo} OfferInfo
 */

export const units = /** @type {IntervalUnit[]} */ ([
  'year', 'month', 'week', 'day'
]);

export const billingKeys = {
  year: 'BillingYearly',
  month: 'BillingMonthly',
  week: 'BillingWeekly',
  day: 'BillingDaily'
};

/**
 * @param {string} unit
 * @returns {string}
 */
export const capitalize = (unit) => {
  return `${unit[0].toUpperCase()}${unit.slice(1)}`;
};

/**
 * @param {import('intl-dom').I18NCallback} _
 * @returns {{
 *   formatPrice: (offer: OfferInfo) => string,
 *   formatBilling: (offer: OfferInfo) => string|DocumentFragment|Text
 * }}
 */
export const getOfferFormatters = (_) => {
  return {
    formatPrice ({amount, currency}) {
      const format = new Intl.NumberFormat(_.resolvedLocale, {
        style: 'currency', currency
      });
      return format.format(
        amount / (10 ** (format.resolvedOptions().maximumFractionDigits || 0))
      );
    },
    formatBilling ({interval, intervalCount = 1}) {
      if (!interval) {
        return _('BillingOneTime');
      }
      return intervalCount === 1
        ? _(billingKeys[interval])
        : _('BillingEveryN', {
          count: String(intervalCount), unit: _(`Unit${capitalize(interval)}`)
        });
    }
  };
};
