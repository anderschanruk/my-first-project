// ── Nav: transparent → frosted on scroll ─────────────────────────────────────
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── Mobile menu ───────────────────────────────────────────────────────────────
const menuBtn  = document.getElementById('menu-btn');
const navLinks = document.getElementById('nav-links');
menuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ── Scroll animations (IntersectionObserver) ──────────────────────────────────
const animateEls = document.querySelectorAll('[data-animate]');
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el    = entry.target;
    const delay = parseInt(el.dataset.delay || 0);
    setTimeout(() => el.classList.add('in-view'), delay);
    revealObs.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

animateEls.forEach(el => revealObs.observe(el));

// ── Animated counters ─────────────────────────────────────────────────────────
function animateCounter(el) {
  const raw    = el.dataset.target;
  const suffix = el.dataset.suffix || '';
  const isFloat = raw.includes('.');
  const target  = parseFloat(raw);
  const duration = 1600;
  const start    = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const value    = target * eased;
    el.textContent = (isFloat ? value.toFixed(2) : Math.round(value)) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    animateCounter(entry.target);
    counterObs.unobserve(entry.target);
  });
}, { threshold: 0.3 });

document.querySelectorAll('.counter').forEach(el => counterObs.observe(el));

// ── Active nav link on scroll ─────────────────────────────────────────────────
const sections   = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => {
        const active = a.getAttribute('href') === '#' + entry.target.id;
        a.style.color = active ? 'rgba(255,255,255,1)' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObs.observe(s));

// ── Tab switching ─────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => {
      c.classList.remove('active');
      // Re-trigger animations for newly visible cards
      c.querySelectorAll('[data-animate]').forEach(el => el.classList.remove('in-view'));
    });
    btn.classList.add('active');
    const panel = document.getElementById('tab-' + btn.dataset.tab);
    panel.classList.add('active');
    // Kick the reveal observer for cards in this tab
    setTimeout(() => {
      panel.querySelectorAll('[data-animate]').forEach(el => revealObs.observe(el));
    }, 20);
  });
});

// ── Smooth parallax on hero image ─────────────────────────────────────────────
const heroBg = document.querySelector('.hero-bg-image');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.5) {
      heroBg.style.transform = `scale(1.05) translateY(${y * 0.18}px)`;
    }
  }, { passive: true });
}
