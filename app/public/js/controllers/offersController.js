/* globals $, Nogin -- `$` is jQuery not ESM, `Nogin` is server-set */
/* eslint-disable unicorn/no-top-level-assignment-in-function,
  compat/compat -- Shared edit state; admin UI on modern browsers */
import '../polyfills/Error.js';
import '../polyfills/console.js';

/**
 * @typedef {Error & {text: string}} AjaxPostError
 */

const xsrfCookie = $('meta[name="csrf-token"]').attr('content');
const TEN = 10;

/**
 * @param {number} digits
 * @returns {number}
 */
const scale = (digits) => {
  let factor = 1;
  for (let i = 0; i < digits; i++) {
    factor *= TEN;
  }
  return factor;
};

/**
 * @param {string} key
 * @returns {string}
 */
const text = (key) => {
  return String(Nogin._(key));
};

/** @type {{slug: string, active: boolean}|null} */
let editing = null;

/**
 * @param {string} currency
 * @returns {number} Decimal places in the currency's minor unit
 */
const getDigits = (currency) => {
  return new Intl.NumberFormat('en', {style: 'currency', currency}).
    resolvedOptions().maximumFractionDigits || 0;
};

/**
 * @param {string} url
 * @param {object} data
 * @returns {Promise<void>}
 */
function post (url, data) {
  // eslint-disable-next-line promise/avoid-new -- Wrapping jQuery
  return new Promise((resolve, reject) => {
    $.ajax(url, {
      type: 'post',
      headers: {'X-XSRF-Token': xsrfCookie},
      data
    }).done(() => {
      resolve();
    }).fail((jqXHR) => {
      const err = /** @type {AjaxPostError} */ (new Error('Ajax POST error'));
      err.text = jqXHR.responseText;
      reject(err);
    });
  });
}

/**
 * @param {unknown} er
 * @returns {void}
 */
const showError = (er) => {
  $('#offerError').text(/** @type {AjaxPostError} */ (er).text);
};

const syncRecurringFields = () => {
  $('#offerRecurringFields').prop('hidden', $('#offerInterval').val() === '');
};
syncRecurringFields();
$('#offerInterval').on('change', syncRecurringFields);

/**
 * @param {string} id
 * @returns {JQuery<HTMLElement>}
 */
const byId = (id) => {
  return $(`[id="${id}"]`);
};

$('#offerForm').on('submit', async (e) => {
  e.preventDefault();
  $('#offerError').text('');
  const form = /** @type {HTMLFormElement} */ (e.currentTarget);
  if (!form.reportValidity()) {
    return;
  }
  const interval = String($('#offerInterval').val());
  const recurring = interval !== '';
  // eslint-disable-next-line no-alert -- Deliberate; grants permanent access
  if (!recurring && !confirm(text('ConfirmLifetimeOffer'))) {
    return;
  }

  const currency = String($('#offerCurrency').val()).trim().toLowerCase();
  let digits;
  try {
    digits = getDigits(currency);
  } catch (err) {
    console.error(err);
    $('#offerError').text(text('bad-offer-currency'));
    return;
  }

  /** @type {{privilegeName: string, value?: string}[]} */
  const privilegeIDs = [];
  $('input[name="offerPrivilege"]:checked').each((_i, box) => {
    const privilegeName = String($(box).val());
    /** @type {{privilegeName: string, value?: string}} */
    const assignment = {privilegeName};
    const valueInput = byId(`offerPrivilegeValue-${privilegeName}`);
    if (valueInput.length) {
      assignment.value = String(valueInput.val());
    }
    privilegeIDs.push(assignment);
  });
  /** @type {string[]} */
  const groupNames = [];
  $('input[name="offerGroup"]:checked').each((_i, box) => {
    groupNames.push(String($(box).val()));
  });

  /** @type {{[key: string]: unknown}} */
  const offer = {
    slug: $('#offerSlug').val(),
    name: $('#offerName').val(),
    description: $('#offerDescription').val(),
    amount: Math.round(
      Number($('#offerAmount').val()) * scale(digits)
    ),
    currency,
    privilegeIDs,
    groupNames,
    active: !editing || editing.active
  };
  if (recurring) {
    offer.interval = interval;
    offer.intervalCount = Number($('#offerIntervalCount').val());
    offer.revokeOnPartialRefund = $('#offerRevokeOnPartialRefund').
      prop('checked');
    const graceUnit = String($('#offerGraceUnit').val());
    if (graceUnit) {
      offer.graceUnit = graceUnit;
      offer.graceCount = Number($('#offerGraceCount').val());
    }
  }
  const receiptText = String($('#offerReceiptText').val());
  if (receiptText) {
    offer.receiptText = receiptText;
  }

  try {
    await post(Nogin.Routes.accessAPI, {
      verb: editing ? 'editOffer' : 'createOffer',
      offer: JSON.stringify(offer)
    });
    location.reload();
  } catch (er) {
    showError(er);
  }
});

$('#resetOffer').on('click', () => {
  location.reload();
});

$('button.editOffer').on('click', (e) => {
  const offer = JSON.parse(String($(e.currentTarget).attr('data-offer')));
  editing = {slug: offer.slug, active: offer.active};
  $('#offerFormHeading').text(text('editOffer'));
  $('#offerSlug').val(offer.slug).prop('disabled', true);
  $('#offerName').val(offer.name);
  $('#offerDescription').val(offer.description);
  $('#offerCurrency').val(offer.currency);
  $('#offerAmount').val(
    offer.amount / scale(getDigits(offer.currency))
  );
  $('#offerInterval').val(offer.interval || '');
  $('#offerIntervalCount').val(offer.intervalCount || 1);
  $('#offerGraceUnit').val(offer.graceUnit || '');
  $('#offerGraceCount').val(offer.graceCount || 0);
  $('#offerRevokeOnPartialRefund').prop(
    'checked', Boolean(offer.revokeOnPartialRefund)
  );
  $('#offerReceiptText').val(offer.receiptText || '');
  syncRecurringFields();

  $('input[name="offerPrivilege"], input[name="offerGroup"]').
    prop('checked', false);
  offer.privilegeIDs.forEach((
    /** @type {string|{privilegeName: string, value: unknown}} */ assignment
  ) => {
    const name = typeof assignment === 'string'
      ? assignment
      : assignment.privilegeName;
    byId(`offerPrivilege-${name}`).prop('checked', true);
    if (typeof assignment !== 'string') {
      byId(`offerPrivilegeValue-${name}`).val(
        typeof assignment.value === 'string'
          ? assignment.value
          : JSON.stringify(assignment.value)
      );
    }
  });
  offer.groupNames.forEach((/** @type {string} */ groupName) => {
    byId(`offerGroup-${groupName}`).prop('checked', true);
  });
  $('#offerForm')[0].scrollIntoView();
});

$('button.archiveOffer').on('click', async (e) => {
  try {
    await post(Nogin.Routes.accessAPI, {
      verb: 'archiveOffer',
      slug: $(e.currentTarget).attr('data-slug'),
      active: $(e.currentTarget).attr('data-active') !== 'true'
    });
    location.reload();
  } catch (er) {
    showError(er);
  }
});
