/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */
import '../polyfills/Error.js';
import '../polyfills/console.js';

/**
 * @typedef {Error & {text: string}} AjaxPostError
 */

const xsrfCookie = $('meta[name="csrf-token"]').attr('content');

/**
 * @param {string} url
 * @param {object} [data]
 * @returns {Promise<{url: string}>}
 */
function post (url, data) {
  // eslint-disable-next-line promise/avoid-new -- Wrapping jQuery
  return new Promise((resolve, reject) => {
    $.ajax(url, {
      type: 'post',
      headers: {'X-XSRF-Token': xsrfCookie},
      data
    }).done(resolve).fail((jqXHR) => {
      const err = /** @type {AjaxPostError} */ (new Error('Ajax POST error'));
      err.text = jqXHR.responseText;
      reject(err);
    });
  });
}

/**
 * @param {string} route
 * @param {object} [data]
 * @returns {Promise<void>}
 */
const goTo = async (route, data) => {
  $('#planError').text('');
  try {
    const {url} = await post(route, data);
    location.assign(url);
  } catch (err) {
    $('#planError').text(/** @type {AjaxPostError} */ (err).text);
  }
};

$('button.buyOffer').on('click', (e) => {
  return goTo(Nogin.Routes.checkout, {
    slug: $(e.currentTarget).attr('data-slug')
  });
});

$('button.manageSubscription').on('click', () => {
  return goTo(Nogin.Routes.portal);
});
