// ── Reading progress bar ──────────────────────────────────────────────────────
const progressBar = document.getElementById('progress-bar');
if (progressBar) {
  function updateProgress() {
    const scrolled = window.scrollY;
    const total    = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();
}

// ── Nav: transparent → frosted on scroll ─────────────────────────────────────
const nav = document.getElementById('nav');
if (nav) {
  function updateNav() { nav.classList.toggle('scrolled', window.scrollY > 30); }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();
}

// ── Mobile nav toggle ─────────────────────────────────────────────────────────
const toggle   = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');
if (toggle && navLinks) {
  toggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    toggle.classList.toggle('open', isOpen);
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });
  navLinks.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navLinks.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open menu');
      document.body.style.overflow = '';
    });
  });
}

// ── Scroll-triggered animations ───────────────────────────────────────────────
const animateEls = document.querySelectorAll('[data-animate]');
const revealObs  = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('in-view'), delay);
    revealObs.unobserve(el);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
animateEls.forEach(el => revealObs.observe(el));

// ── Animated counters ─────────────────────────────────────────────────────────
function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function animateCounter(el) {
  const raw      = el.dataset.target;
  const suffix   = el.dataset.suffix || '';
  const isFloat  = raw.includes('.');
  const target   = parseFloat(raw);
  const duration = 1800;
  const start    = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = easeOutCubic(progress);
    const value    = target * eased;
    el.textContent = (isFloat ? value.toFixed(1) : Math.round(value)) + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    counterObs.unobserve(entry.target);
  });
}, { threshold: 0.4 });
document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

// ── Tab switching with accessibility ──────────────────────────────────────────
const tabs   = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

if (tabs.length) {
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      tabs.forEach(t => { t.setAttribute('aria-selected', t === tab ? 'true' : 'false'); });
      panels.forEach(panel => {
        const isTarget = panel.id === 'tab-' + target;
        panel.classList.toggle('active', isTarget);
        if (isTarget) {
          panel.querySelectorAll('[data-animate]').forEach(el => el.classList.remove('in-view'));
          setTimeout(() => {
            panel.querySelectorAll('[data-animate]').forEach(el => revealObs.observe(el));
          }, 30);
        }
      });
    });

    tab.addEventListener('keydown', e => {
      if (!['ArrowLeft','ArrowRight'].includes(e.key)) return;
      const tabArr = [...tabs];
      const idx    = tabArr.indexOf(tab);
      const next   = e.key === 'ArrowRight'
        ? tabArr[(idx + 1) % tabArr.length]
        : tabArr[(idx - 1 + tabArr.length) % tabArr.length];
      next.click();
      next.focus();
    });
  });
}

// ── Parallax hero background ──────────────────────────────────────────────────
const heroBgImg = document.querySelector('.hero-bg-img');
if (heroBgImg && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.5) {
      heroBgImg.style.transform = `translateY(${y * 0.15}px)`;
    }
  }, { passive: true });
}

// ── Active nav link on scroll ─────────────────────────────────────────────────
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

if (sections.length && navAnchors.length) {
  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navAnchors.forEach(a => {
        const active = a.getAttribute('href') === '#' + entry.target.id;
        a.style.color = active ? '#fff' : '';
      });
    });
  }, { threshold: 0.35 });
  sections.forEach(s => sectionObs.observe(s));
}

// ── FAQ accordion ─────────────────────────────────────────────────────────────
document.querySelectorAll('.faq-item').forEach(item => {
  const trigger = item.querySelector('.faq-trigger');
  const body    = item.querySelector('.faq-body');
  if (!trigger || !body) return;

  trigger.addEventListener('click', () => {
    const isOpen = item.classList.toggle('open');
    trigger.setAttribute('aria-expanded', isOpen);
    body.hidden = !isOpen;
  });
});
