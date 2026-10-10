
    // Agent-ID personalization — scoped to referral links on this page only.
    (function () {
      const DEFAULT_AGENT_ID = 'AA0233';
      const STORAGE_KEY = 'dbr-products-agent-id';
      const form = document.getElementById('agentIdForm');
      const input = document.getElementById('agentIdInput');
      const status = document.getElementById('agentIdStatus');
      const clearButton = document.getElementById('agentIdClear');
      if (!form || !input || !status || !clearButton) return;

      const referralLinks = Array.from(document.querySelectorAll('a[href*="refid="]')).filter((link) => {
        try {
          return new URL(link.href, window.location.href).searchParams.get('refid') === DEFAULT_AGENT_ID;
        } catch (_) {
          return false;
        }
      });

      referralLinks.forEach((link) => {
        link.dataset.referralOriginal = link.getAttribute('href');
      });

      function normalizeAgentId(value) {
        const compact = String(value || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
        if (/^\d{4}$/.test(compact)) return 'AA' + compact;
        if (/^AA\d{4}$/.test(compact)) return compact;
        return null;
      }

      function applyAgentId(agentId) {
        referralLinks.forEach((link) => {
          const url = new URL(link.dataset.referralOriginal, window.location.href);
          url.searchParams.set('refid', agentId);
          link.href = url.toString();
        });
      }

      function setStatus(message, isError) {
        status.textContent = message;
        status.classList.toggle('is-error', Boolean(isError));
      }

      function useDefaultAgentId(message) {
        applyAgentId(DEFAULT_AGENT_ID);
        input.value = '';
        setStatus(message || `Using the default ${DEFAULT_AGENT_ID} link on ${referralLinks.length} personal links.`);
      }

      let savedId = null;
      try {
        savedId = normalizeAgentId(localStorage.getItem(STORAGE_KEY));
      } catch (_) {}

      if (savedId) {
        input.value = savedId;
        applyAgentId(savedId);
        setStatus(`${referralLinks.length} personal links are ready with ${savedId}.`);
      } else {
        useDefaultAgentId();
      }

      form.addEventListener('submit', (event) => {
        event.preventDefault();
        const agentId = normalizeAgentId(input.value);
        if (!agentId) {
          setStatus('Enter a valid ID: AA followed by four digits, or just four digits.', true);
          input.focus();
          return;
        }
        try {
          localStorage.setItem(STORAGE_KEY, agentId);
        } catch (_) {}
        input.value = agentId;
        applyAgentId(agentId);
        setStatus(`Saved ${agentId}. ${referralLinks.length} personal links now use your code.`);
      });

      clearButton.addEventListener('click', () => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
        useDefaultAgentId(`Saved ID cleared. Using the default ${DEFAULT_AGENT_ID} link on ${referralLinks.length} personal links.`);
      });
    })();

    // Scroll-to-top toggle
    const btn = document.getElementById('scrollTopBtn');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    }, { passive: true });
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    });
  
// Search the static collection; section links restore all products before navigating.
(() => {
 const input=document.getElementById('product-search');
 const cards=[...document.querySelectorAll('.card')];
 const sections=[...document.querySelectorAll('.product-section')];
 document.querySelector('.search-tools').hidden=false;
 function filter(){
  const words=input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let count=0;
  cards.forEach(card=>{card.hidden=!words.every(word=>card.textContent.toLowerCase().includes(word));if(!card.hidden) count++;});
  sections.forEach(section=>{const n=section.querySelectorAll('.card:not([hidden])').length;section.hidden=n===0;section.querySelector('.section-count').textContent=n+' resource'+(n===1?'':'s');});
  document.getElementById('empty').hidden=count!==0;
  document.getElementById('search-status').textContent=words.length?`${count} of 18 resources found`:'18 resources across 6 pathways';
 }
 input.addEventListener('input',filter);
 document.getElementById('clear-search').addEventListener('click',()=>{input.value='';filter();input.focus();});
 document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{input.value='';filter();}));
})();
