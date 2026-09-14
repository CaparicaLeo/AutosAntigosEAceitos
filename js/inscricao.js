const form = document.getElementById('registrationForm');
const submitBtn = document.getElementById('submitBtn');
const submitLabel = document.getElementById('submitLabel');
const formAlert = document.getElementById('formAlert');
const ticket = document.querySelector('.ticket');
const successView = document.getElementById('successView');
const successCode = document.getElementById('successCode');
const termosCheckbox = document.getElementById('termos');
const termosError = document.getElementById('termosError');

const VALIDATORS = {
  nome: v => v.trim().length >= 3,
  telefone: v => v.replace(/\D/g, '').length >= 10,
  email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  cidade: v => v.trim().length >= 2,
  modelo: v => v.trim().length >= 2,
  ano: v => {
    const n = Number(v);
    return n >= 1900 && n <= 2026;
  },
};

function setFieldError(name, hasError) {
  const wrap = form.querySelector(`[data-field="${name}"]`);
  if (wrap) wrap.classList.toggle('error', hasError);
}

function validateForm() {
  let valid = true;
  Object.entries(VALIDATORS).forEach(([name, fn]) => {
    const input = form.elements[name];
    const ok = fn(input.value || '');
    setFieldError(name, !ok);
    if (!ok) valid = false;
  });

  if (!termosCheckbox.checked) {
    termosError.textContent = 'Você precisa concordar para continuar.';
    valid = false;
  } else {
    termosError.textContent = '';
  }

  return valid;
}

function showAlert(message) {
  formAlert.textContent = message;
  formAlert.classList.add('show');
}
function hideAlert() {
  formAlert.classList.remove('show');
}

function collectPayload() {
  const data = Object.fromEntries(new FormData(form).entries());
  data.acompanhantes = Number(data.acompanhantes || 0);
  data.ano = Number(data.ano);
  data.termos = !!termosCheckbox.checked;
  data.origem = 'site';
  return data;
}

async function submitInscricao(payload) {
  // ------------------------------------------------------------
  // MOCK_MODE: simula uma resposta de backend enquanto os
  // endpoints reais não existem. Troque CONFIG.MOCK_MODE para
  // false em js/config.js assim que o backend estiver no ar.
  // ------------------------------------------------------------
  if (typeof CONFIG !== 'undefined' && CONFIG.MOCK_MODE) {
    await new Promise(r => setTimeout(r, 900));
    const fakeId = Math.floor(1000 + Math.random() * 8999);

    // guarda em memória (não persiste ao recarregar) para o
    // painel admin conseguir listar algo de exemplo nesta sessão
    window.__MOCK_INSCRICOES__ = window.__MOCK_INSCRICOES__ || [];
    window.__MOCK_INSCRICOES__.push({ id: fakeId, ...payload, criado_em: new Date().toISOString() });

    return { ok: true, id: fakeId };
  }

  const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.CRIAR_INSCRICAO, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let msg = 'Não foi possível enviar sua inscrição. Tente novamente.';
    try {
      const errBody = await res.json();
      if (errBody && errBody.message) msg = errBody.message;
    } catch (_) {}
    throw new Error(msg);
  }

  const body = await res.json().catch(() => ({}));
  return { ok: true, id: body.id ?? body.codigo ?? '----' };
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  hideAlert();

  if (!validateForm()) {
    showAlert('Confira os campos destacados antes de enviar.');
    const firstError = form.querySelector('.field.error input, .field.error textarea');
    if (firstError) firstError.focus();
    return;
  }

  submitBtn.disabled = true;
  submitLabel.textContent = 'Enviando…';

  try {
    const payload = collectPayload();
    const result = await submitInscricao(payload);

    form.style.display = 'none';
    document.querySelector('.form-actions').style.display = 'none';
    successCode.textContent = '#' + String(result.id).padStart(4, '0');
    successView.classList.add('show');
    successView.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    showAlert(err.message || 'Algo deu errado. Tente novamente em instantes.');
    submitBtn.disabled = false;
    submitLabel.textContent = 'Confirmar inscrição';
  }
});

// limpa o erro de um campo assim que a pessoa começa a corrigir
form.addEventListener('input', (e) => {
  const wrap = e.target.closest('.field');
  if (wrap && wrap.classList.contains('error')) {
    const name = wrap.dataset.field;
    const validator = VALIDATORS[name];
    if (!validator || validator(e.target.value)) wrap.classList.remove('error');
  }
});
termosCheckbox.addEventListener('change', () => {
  if (termosCheckbox.checked) termosError.textContent = '';
});
