/**
 * @param {{
*   _: import('intl-dom').I18NCallback,
*   layout: import('../routeUtils.js').LayoutCallback
* }} cfg
*/
const accessAPI = ({_, layout}) => {
  return layout({
    content: [
      ['div', {
        role: 'main'
      }, [
        ['h1', [
          _('accessAPI')
        ]],
        `(To be added)`
      ]]
    ]
  });
};

export default accessAPI;
