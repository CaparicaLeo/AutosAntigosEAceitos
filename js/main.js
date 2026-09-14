// -------------------------------------------------------------
// Menu mobile
// -------------------------------------------------------------
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    navLinks.classList.remove('open');
  }));
}

// -------------------------------------------------------------
// Contagem regressiva até o evento (17/10/2026, 10h) — estilo odômetro
// -------------------------------------------------------------
const EVENT_DATE = new Date('2026-10-17T10:00:00-03:00');

function pad(n) { return String(n).padStart(2, '0'); }

function updateDigits(el, value) {
  if (el.textContent === value) return;
  el.textContent = value;
  el.classList.remove('roll');
  // força reflow para reiniciar a animação
  void el.offsetWidth;
  el.classList.add('roll');
}

function tickCountdown() {
  const now = new Date();
  let diff = EVENT_DATE - now;
  if (diff < 0) diff = 0;

  const dias  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const horas = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const min   = Math.floor((diff / (1000 * 60)) % 60);
  const seg   = Math.floor((diff / 1000) % 60);

  const map = { dias, horas, min, seg };
  document.querySelectorAll('#countdown .digits').forEach(el => {
    const unit = el.dataset.unit;
    updateDigits(el, pad(map[unit]));
  });
}

if (document.getElementById('countdown')) {
  tickCountdown();
  setInterval(tickCountdown, 1000);
}

// -------------------------------------------------------------
// Leve parallax no carro do hero ao rolar a página (só desktop,
// e respeita prefers-reduced-motion)
// -------------------------------------------------------------
const heroCar = document.getElementById('heroCar');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroCar && !prefersReducedMotion && window.innerWidth > 900) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < 700) {
      heroCar.style.transform = `translateY(${y * 0.12}px)`;
    }
  }, { passive: true });
}
