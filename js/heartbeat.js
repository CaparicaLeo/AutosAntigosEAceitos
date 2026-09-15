// -------------------------------------------------------------
// Keep-alive do backend (Render free tier dorme após inatividade).
// Ping no GET /api/health na carga e a cada 15 minutos.
// -------------------------------------------------------------
(function () {
  const HEALTH_URL = (typeof CONFIG !== 'undefined' ? CONFIG.BASE_URL : '') + '/health';
  const INTERVAL_MS = 15 * 60 * 1000;
  const TIMEOUT_MS = 10 * 1000;

  function pingHealth() {
    if (!HEALTH_URL) return;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    fetch(HEALTH_URL, { method: 'GET', cache: 'no-store', signal: controller.signal })
      .then((res) => {
        const ok = res.ok;
        document.documentElement.dataset.backend = ok ? 'ok' : 'down';
        console.log(`[keep-alive] backend ${ok ? 'online' : 'indisponível'} (${res.status})`);
      })
      .catch((err) => {
        document.documentElement.dataset.backend = 'down';
        console.warn('[keep-alive] falha no ping:', err.message || err);
      })
      .finally(() => clearTimeout(timer));
  }

  pingHealth();
  setInterval(pingHealth, INTERVAL_MS);
})();