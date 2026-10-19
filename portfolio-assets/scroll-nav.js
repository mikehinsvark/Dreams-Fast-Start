(() => {
  'use strict';
  const rail = document.getElementById('portfolio-scroll-nav');
  const grid = document.getElementById('resource-grid');
  if (!rail || !grid) return;

  const stops = rail.querySelector('.scroll-stops');
  const up = rail.querySelector('[data-scroll="up"]');
  const down = rail.querySelector('[data-scroll="down"]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let points = [];
  let measurementFrame = 0;
  let scrollFrame = 0;

  function maximumScroll() {
    return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  }

  function scrollToPosition(top) {
    window.scrollTo({
      top: Math.max(0, Math.min(maximumScroll(), top)),
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  }

  function move(direction) {
    const distance = Math.max(240, window.innerHeight * 0.8);
    scrollToPosition(window.scrollY + direction * distance);
  }

  function syncProgress() {
    scrollFrame = 0;
    const y = window.scrollY;
    const maximum = maximumScroll();
    up.disabled = y <= 2;
    down.disabled = y >= maximum - 2;
    let current = 0;
    let nearest = Infinity;
    points.forEach((point, index) => {
      const distance = Math.abs(point.top - y);
      if (distance < nearest) {
        nearest = distance;
        current = index;
      }
    });
    if (y <= 2) current = 0;
    if (y >= maximum - 2) current = Math.max(0, points.length - 1);
    stops.querySelectorAll('button').forEach((button, index) => {
      if (index === current) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }

  function requestProgress() {
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncProgress);
  }

  function measure() {
    measurementFrame = 0;
    const maximum = maximumScroll();
    const candidates = [{ top: 0, label: 'Back to the top — DREAMS hero' }];
    const cards = Array.from(grid.querySelectorAll('.resource'));
    const groupSize = Math.max(1, Math.ceil(cards.length / 6));
    const collection = document.getElementById('resources');
    if (!cards.length && collection) {
      candidates.push({
        top: collection.getBoundingClientRect().top + window.scrollY - 24,
        label: 'Go to the resource search and filters',
      });
    }
    for (let index = 0; index < cards.length; index += groupSize) {
      const end = Math.min(index + groupSize, cards.length);
      const title = cards[index].querySelector('h3')?.textContent || 'Resources';
      const reference = index === 0 && collection ? collection : cards[index];
      candidates.push({
        top: reference.getBoundingClientRect().top + window.scrollY - 24,
        label: `Go to resources ${index + 1}–${end}: ${title}`,
      });
    }
    candidates.push({ top: maximum, label: 'Go to the bottom — DREAMS footer' });
    points = [];
    candidates.forEach(point => {
      const top = Math.max(0, Math.min(maximum, Math.round(point.top)));
      if (!points.some(existing => Math.abs(existing.top - top) < 2)) {
        points.push({ top, label: point.label });
      }
    });
    // Keep keyboard focus when only responsive measurements have changed.
    const labels = JSON.stringify(points.map(point => point.label));
    if (stops.dataset.labels !== labels) {
      const buttons = points.map((point, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'scroll-stop';
        button.dataset.stop = String(index);
        button.setAttribute('aria-label', point.label);
        button.title = point.label;
        return button;
      });
      stops.replaceChildren(...buttons);
      stops.dataset.labels = labels;
    }
    syncProgress();
  }

  function requestMeasurement() {
    if (!measurementFrame) measurementFrame = requestAnimationFrame(measure);
  }

  up.addEventListener('click', () => move(-1));
  down.addEventListener('click', () => move(1));
  stops.addEventListener('click', event => {
    const button = event.target.closest('[data-stop]');
    if (button && points[Number(button.dataset.stop)]) {
      scrollToPosition(points[Number(button.dataset.stop)].top);
    }
  });
  rail.addEventListener('keydown', event => {
    const actions = {
      Home: () => scrollToPosition(0),
      End: () => scrollToPosition(maximumScroll()),
      ArrowUp: () => move(-1),
      ArrowDown: () => move(1),
    };
    if (actions[event.key]) {
      event.preventDefault();
      actions[event.key]();
    }
  });
  window.addEventListener('scroll', requestProgress, { passive: true });
  window.addEventListener('resize', requestMeasurement, { passive: true });
  window.addEventListener('load', requestMeasurement);
  new MutationObserver(requestMeasurement).observe(grid, { childList: true });
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(requestMeasurement);
    observer.observe(document.body);
    observer.observe(grid);
  }
  if (document.fonts?.ready) document.fonts.ready.then(requestMeasurement);
  rail.hidden = false;
  measure();
})();
