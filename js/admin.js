// -------------------------------------------------------------
// Login contra a API (POST /login -> { email, password } -> token)
// -------------------------------------------------------------
const loginScreen = document.getElementById('loginScreen');
const adminShell = document.getElementById('adminShell');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginLabel = document.getElementById('loginLabel');
const logoutBtn = document.getElementById('logoutBtn');

let authToken = null;

async function handleLogin(email, senha) {
  const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.LOGIN_ADMIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: senha }),
  });
  if (!res.ok) throw new Error('E-mail ou senha incorretos.');
  const data = await res.json();
  if (!data.token) throw new Error('E-mail ou senha incorretos.');
  return data;
}

async function handleLogout() {
  if (!authToken) return;
  try {
    await fetch(CONFIG.BASE_URL + '/logout', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
  } catch (_) {}
  authToken = null;
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.remove('show');
  loginLabel.textContent = 'Entrando…';

  try {
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const data = await handleLogin(email, senha);
    authToken = data.token;

    loginScreen.style.display = 'none';
    adminShell.classList.add('show');
    loadInscricoes();
  } catch (err) {
    loginError.textContent = err.message || 'E-mail ou senha incorretos.';
    loginError.classList.add('show');
  } finally {
    loginLabel.textContent = 'Entrar';
  }
});

logoutBtn.addEventListener('click', async () => {
  await handleLogout();
  adminShell.classList.remove('show');
  loginScreen.style.display = 'flex';
  loginForm.reset();
});

// -------------------------------------------------------------
// Dados (consumo dos endpoints reais)
// -------------------------------------------------------------
const tableBody = document.getElementById('tableBody');
const tableLoading = document.getElementById('tableLoading');
const tableEmpty = document.getElementById('tableEmpty');
const dataTable = document.getElementById('dataTable');
const searchInput = document.getElementById('searchInput');
const updatedAt = document.getElementById('updatedAt');

let allInscricoes = [];

function authHeaders() {
  return { 'Authorization': `Bearer ${authToken}` };
}

async function fetchInscricoes() {
  const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.LISTAR_INSCRICOES, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Não foi possível carregar as inscrições.');
  return res.json();
}

async function removerInscricao(id) {
  const res = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.REMOVER_INSCRICAO}/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.ok;
}

// -------------------------------------------------------------
// Render
// -------------------------------------------------------------
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function companionList(visitor) {
  const list = Array.isArray(visitor.additional_visitors) ? visitor.additional_visitors : [];
  return list.join(', ');
}

function renderStats(items) {
  document.getElementById('statTotal').textContent = items.length;
  const pessoas = items.reduce((acc, i) => acc + 1 + (Array.isArray(i.additional_visitors) ? i.additional_visitors.length : 0), 0);
  document.getElementById('statPessoas').textContent = pessoas;
  const hoje = new Date().toDateString();
  document.getElementById('statHoje').textContent = items.filter(i => new Date(i.created_at).toDateString() === hoje).length;
}

function renderTable(items) {
  if (!items.length) {
    tableBody.innerHTML = '';
    tableEmpty.style.display = 'block';
    return;
  }
  tableEmpty.style.display = 'none';
  tableBody.innerHTML = items.map(i => `
    <tr>
      <td class="num">#${i.id}</td>
      <td>${escapeHtml(i.name)}<br><span class="badge">${escapeHtml(i.email || '')}</span></td>
      <td>${escapeHtml(i.email || '')}</td>
      <td>${escapeHtml(i.phone_number || '')}</td>
      <td>${escapeHtml(companionList(i)) || '—'}</td>
      <td>${formatDate(i.created_at)}</td>
      <td class="row-actions"><button data-id="${i.id}" class="removerBtn">Remover</button></td>
    </tr>
  `).join('');

  tableBody.querySelectorAll('.removerBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm('Remover esta inscrição?')) return;
      const id = btn.dataset.id;
      btn.textContent = 'Removendo…';
      const ok = await removerInscricao(id);
      if (ok) {
        allInscricoes = allInscricoes.filter(i => String(i.id) !== String(id));
        applyFilters();
        renderStats(allInscricoes);
      } else {
        btn.textContent = 'Remover';
        alert('Não foi possível remover. Tente novamente.');
      }
    });
  });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function applyFilters() {
  const term = searchInput.value.trim().toLowerCase();
  const filtered = allInscricoes.filter(i => {
    const haystack = [i.name, i.email, i.phone_number, companionList(i)].join(' ').toLowerCase();
    return !term || haystack.includes(term);
  });
  renderTable(filtered);
}

async function loadInscricoes() {
  tableLoading.style.display = 'block';
  dataTable.style.display = 'none';
  tableEmpty.style.display = 'none';

  try {
    allInscricoes = await fetchInscricoes();
    allInscricoes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    renderStats(allInscricoes);
    applyFilters();
    updatedAt.textContent = 'Atualizado às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    tableEmpty.textContent = err.message || 'Erro ao carregar inscrições.';
    tableEmpty.style.display = 'block';
  } finally {
    tableLoading.style.display = 'none';
    dataTable.style.display = 'table';
  }
}

searchInput.addEventListener('input', applyFilters);
document.getElementById('refreshBtn').addEventListener('click', loadInscricoes);

// -------------------------------------------------------------
// Exportar CSV
// -------------------------------------------------------------
document.getElementById('exportBtn').addEventListener('click', () => {
  if (!allInscricoes.length) return;
  const headers = ['id', 'name', 'email', 'phone_number', 'additional_visitors', 'created_at'];
  const rows = allInscricoes.map(i => headers.map(h => `"${String(h === 'additional_visitors' ? companionList(i) : i[h] ?? '').replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inscritos-autos-antigos-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});