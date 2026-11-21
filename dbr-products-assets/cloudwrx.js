/* Independent CloudWRX personalization: never reads or writes the DREAMS agent ID. */
(() => {
  'use strict';
  const DEFAULT_CODE = 'bbq4pucskp';
  const STORAGE_KEY = 'dbr-products-cloudwrx-code';
  const QUERY_KEY = 'cloudwrxref';
  const form = document.getElementById('cloudwrxCodeForm');
  if (!form) return;
  const input = document.getElementById('cloudwrxCodeInput');
  const status = document.getElementById('cloudwrxCodeStatus');
  const links = [...document.querySelectorAll('#cloudwrx [data-cloudwrx-link]')];
  const normalize = value => /^[A-Za-z0-9_-]{1,64}$/.test(String(value || '').trim()) ? String(value).trim() : null;
  const report = (message, error = false) => {
    status.textContent = message;
    status.classList.toggle('is-error', error);
  };
  function apply(code) {
    links.forEach(link => {
      const url = new URL(link.dataset.cloudwrxLink);
      url.searchParams.set('ref', code);
      link.href = url.toString();
    });
    document.querySelectorAll('[data-cloudwrx-url-for]').forEach(field => {
      field.value = document.getElementById(field.dataset.cloudwrxUrlFor).href;
    });
  }
  function syncUrl(code) {
    const url = new URL(window.location.href);
    if (code) url.searchParams.set(QUERY_KEY, code);
    else url.searchParams.delete(QUERY_KEY);
    window.history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  let saved = null;
  try { saved = normalize(localStorage.getItem(STORAGE_KEY)); } catch (_) {}
  const shared = new URLSearchParams(window.location.search).get(QUERY_KEY);
  const initial = normalize(shared) || saved || DEFAULT_CODE;
  input.value = initial;
  apply(initial);
  report(`The two CloudWRX links use ${initial}. Your DREAMS ID is separate.`);
  if (shared !== null && !normalize(shared)) report('The shared CloudWRX code is invalid. Enter your correct code before sharing these links.', true);
  form.addEventListener('submit', event => {
    event.preventDefault();
    const code = normalize(input.value);
    if (!code) {
      report('Enter your CloudWRX code using letters, numbers, hyphens or underscores (up to 64 characters).', true);
      input.focus();
      return;
    }
    let stored = true;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (_) { stored = false; }
    input.value = code;
    apply(code);
    syncUrl(code);
    report(`Both CloudWRX links now use ${code}. ${stored ? 'Saved on this device.' : 'Updated for this visit; browser storage is unavailable.'}`);
  });
  document.getElementById('cloudwrxCodeClear').addEventListener('click', () => {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    input.value = DEFAULT_CODE;
    apply(DEFAULT_CODE);
    syncUrl(null);
    report(`Saved CloudWRX code cleared. The two links use the default ${DEFAULT_CODE}.`);
  });
  document.querySelectorAll('[data-cloudwrx-copy]').forEach(button => button.addEventListener('click', async () => {
    const field = document.getElementById(button.dataset.cloudwrxCopy);
    try {
      await navigator.clipboard.writeText(field.value);
      report(`${button.dataset.copyLabel} link copied. Ready to share.`);
    } catch (_) {
      field.focus(); field.select();
      report('Your link is selected. Copy it using your browser or keyboard.');
    }
  }));
})();
