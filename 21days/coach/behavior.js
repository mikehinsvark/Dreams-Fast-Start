export function mountCoach(root) {
  if (!root) return () => {};
  const controller = new AbortController();
  const on = (element, event, handler) => element.addEventListener(event, handler, {signal: controller.signal});
  const storageKey = 'dreams-beginner-next-action-v2';
  const form = root.querySelector('#bc-action-form');
  const saveStatus = root.querySelector('#bc-save-status');
  const note = root.querySelector('#bc-note');
  const fields = ['person', 'action', 'owner', 'due', 'done', 'status', 'result'];
  let savedAt = '';
  let dirty = false;

  function getValues() {
    return Object.fromEntries(fields.map(name => [name, form.elements.namedItem(name).value.trim()]));
  }
  function renderNote() {
    const v = getValues();
    note.value = [
      'MY DREAMS RESUME NOTE',
      `Prepared: ${new Date().toLocaleString()}`,
      `Browser save: ${savedAt && !dirty ? savedAt : 'Current changes not saved in browser'}`,
      `Person or audience: ${v.person || 'Not chosen yet'}`,
      `One action: ${v.action || 'Not chosen yet'}`,
      `Owner: ${v.owner || 'Not chosen yet'}`,
      `Due: ${v.due || 'Not chosen yet'}`,
      `Done means: ${v.done || 'Not chosen yet'}`,
      `Progress: ${v.status}`,
      `What actually happened: ${v.result || 'Not reported yet'}`,
      '',
      'Coach: Ask one question at a time. Use only the progress I reported. Help me choose my next meaningful action. A sent invitation is not a held appointment.'
    ].join('\n');
    return note.value;
  }
  function showStatus(target, message) {
    target.textContent = message;
  }
  async function copyText(target, status) {
    const value = target.value;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      if (controller.signal.aborted) return;
      showStatus(status, 'Copied. Paste this into your chat.');
    } catch {
      if (controller.signal.aborted) return;
      let parent = target.parentElement;
      while (parent && parent !== root) {
        if (parent.tagName === 'DETAILS') parent.open = true;
        parent = parent.parentElement;
      }
      target.focus();
      target.select();
      showStatus(status, 'Automatic copy is unavailable. The message is selected below; use Copy on your device.');
    }
  }
  root.querySelectorAll('[data-bc-copy]').forEach(button => {
    on(button, 'click', () => {
      const target = root.querySelector(`#${button.dataset.bcCopy}`);
      // Keep feedback next to the button the person just used.
      let status = button.closest('.bc-card, .bc-panel-body, .bc-start').querySelector('.bc-button-status');
      if (!status) {
        status = document.createElement('p');
        status.className = 'bc-feedback bc-button-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        (button.closest('.bc-actions') || button).insertAdjacentElement('afterend', status);
      }
      copyText(target, status);
    });
  });
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved.version === 2 && saved.values && typeof saved.values === 'object') {
        fields.forEach(name => {
          const field = form.elements.namedItem(name);
          const value = saved.values[name];
          if (typeof value === 'string' && (name !== 'status' || ['Done', 'Tried', 'Not started'].includes(value))) {
            field.value = value.slice(0, field.maxLength > 0 ? field.maxLength : 500);
          }
        });
        savedAt = typeof saved.savedAt === 'string' ? saved.savedAt : '';
        showStatus(saveStatus, `Your saved action is ready${savedAt ? ` — ${savedAt}` : ''}. Review what happened before your next step.`);
      }
    }
  } catch {
    showStatus(saveStatus, 'Browser storage is unavailable or the saved note could not be read. You can still fill in this card and download a resume note.');
  }
  renderNote();
  on(form, 'input', () => {
    dirty = true;
    showStatus(saveStatus, 'You have changes to save or download.');
    renderNote();
  });
  on(form, 'submit', event => {
    event.preventDefault();
    const timestamp = new Date().toLocaleString();
    const payload = JSON.stringify({version: 2, savedAt: timestamp, values: getValues()});
    try {
      localStorage.setItem(storageKey, payload);
      if (localStorage.getItem(storageKey) !== payload) throw new Error('Save verification failed');
      savedAt = timestamp;
      dirty = false;
      renderNote();
      showStatus(saveStatus, `Saved and checked in this browser — ${savedAt}. Download a resume note for a separate copy.`);
    } catch {
      dirty = true;
      renderNote();
      showStatus(saveStatus, 'This browser could not save the card. Download or copy your resume note before leaving this page.');
    }
  });
  on(root.querySelector('#bc-copy-note'), 'click', () => {
    renderNote();
    copyText(note, saveStatus);
  });
  on(root.querySelector('#bc-download-note'), 'click', () => {
    const blob = new Blob([renderNote()], {type: 'text/plain;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'My-Dreams-Resume-Note.txt';
    root.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showStatus(saveStatus, 'Download requested. Check your device’s downloads for My-Dreams-Resume-Note.txt.');
  });
  return () => controller.abort();
}
