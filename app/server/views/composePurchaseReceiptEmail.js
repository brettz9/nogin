/**
 * @typedef {(cfg: {
 *   _: import('../modules/email-dispatcher.js').Internationalizer,
 *   langDir: {dir: "rtl"|"ltr"|undefined, lang: string},
 *   jml: typeof import('jamilih').jml,
 *   baseurl: string,
 *   name: string,
 *   offerName: string,
 *   priceText: string,
 *   billingText: string,
 *   receiptText?: string,
 *   fromText: string,
 *   fromURL: string
 * }) => import('jamilih').JamilihDoc} ComposePurchaseReceiptEmail
 */

/** @type {ComposePurchaseReceiptEmail} */
const composePurchaseReceiptEmail = ({
  _, langDir, jml, name, offerName, priceText, billingText, receiptText,
  fromText, fromURL
}) => {
  return {$document: {
    childNodes: [
      ['html', langDir, [
        ['body', [
          _('HiPerson', {name}),
          ['br', 'br'],
          _('ThanksForPurchase', {offer: jml('b', [offerName])}),
          ['br'],
          _('ReceiptAmount', {price: priceText, billing: billingText}),
          ['br', 'br'],
          ...(receiptText
            ? [['p', {style: 'white-space: pre-line'}, [receiptText]]]
            : []),
          _('Regards'), ['br'],
          ['a', {
            href: fromURL
          }, [
            fromText
          ]], ['br', 'br']
        ]]
      ]]
    ]
  }};
};

export default composePurchaseReceiptEmail;
