/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   layout: import('../routeUtils.js').LayoutCallback
* }} cfg
*/
const four0four = ({_, layout}) => {
  return layout({
    content: [
      ['div', {
        id: 'four04',
        'data-name': 'four04',
        role: 'main'
      }, [
        _('SorryUnavailable')
      ]]
    ]
  });
};

export default four0four;
