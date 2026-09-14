// -------------------------------------------------------------
// Login (simulado até o backend existir — ver CONFIG.ENDPOINTS.LOGIN_ADMIN)
// -------------------------------------------------------------
const loginScreen = document.getElementById('loginScreen');
const adminShell = document.getElementById('adminShell');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginLabel = document.getElementById('loginLabel');
const logoutBtn = document.getElementById('logoutBtn');

async function handleLogin(usuario, senha) {
  if (typeof CONFIG !== 'undefined' && CONFIG.MOCK_MODE) {
    await new Promise(r => setTimeout(r, 500));
    if (!usuario || !senha) throw new Error('Preencha usuário e senha.');
    return { token: 'mock-token' };
  }
  const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.LOGIN_ADMIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ usuario, senha }),
  });
  if (!res.ok) throw new Error('Usuário ou senha incorretos.');
  return res.json();
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.classList.remove('show');
  loginLabel.textContent = 'Entrando…';

  try {
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value;
    await handleLogin(usuario, senha);

    loginScreen.style.display = 'none';
    adminShell.classList.add('show');
    loadInscricoes();
  } catch (err) {
    loginError.textContent = err.message || 'Usuário ou senha incorretos.';
    loginError.classList.add('show');
  } finally {
    loginLabel.textContent = 'Entrar';
  }
});

logoutBtn.addEventListener('click', () => {
  adminShell.classList.remove('show');
  loginScreen.style.display = 'flex';
  loginForm.reset();
});

// -------------------------------------------------------------
// Dados (mock ou backend real)
// -------------------------------------------------------------
const tableBody = document.getElementById('tableBody');
const tableLoading = document.getElementById('tableLoading');
const tableEmpty = document.getElementById('tableEmpty');
const dataTable = document.getElementById('dataTable');
const searchInput = document.getElementById('searchInput');
const cidadeFilter = document.getElementById('cidadeFilter');
const updatedAt = document.getElementById('updatedAt');

let allInscricoes = [];

function mockDataset() {
  const nomes = ['Carlos Menezes', 'Fernanda Ap. Silva', 'João Vitor Ramos', 'Patrícia Zanetti', 'Rogério Tadeu', 'Marina Costa', 'Eduardo Baggio', 'Luciana Prado'];
  const modelos = ['Ford Maverick GT', 'Chevrolet Opala SS', 'Volkswagen Fusca 1300', 'Ford Corcel GT', 'Puma GTE', 'Dodge Dart', 'Chevrolet Chevette', 'Ford Galaxie 500'];
  const cidades = ['Curitiba', 'São José dos Pinhais', 'Colombo', 'Araucária', 'Pinhais', 'Curitiba', 'Fazenda Rio Grande', 'Curitiba'];
  const cores = ['Azul', 'Vermelho', 'Branco', 'Preto', 'Verde musgo', 'Prata', 'Amarelo', 'Bege'];

  return nomes.map((nome, i) => ({
    id: 1000 + i,
    nome,
    telefone: `(41) 9${8000 + i}-00${i}0`,
    email: nome.toLowerCase().replace(/[^a-z]+/g, '.') + '@email.com',
    cidade: cidades[i],
    modelo: modelos[i],
    ano: 1968 + i * 3,
    cor: cores[i],
    placa: '',
    acompanhantes: i % 3,
    criado_em: new Date(Date.now() - i * 3600 * 1000 * (i + 1)).toISOString(),
  }));
}

async function fetchInscricoes() {
  if (typeof CONFIG !== 'undefined' && CONFIG.MOCK_MODE) {
    await new Promise(r => setTimeout(r, 700));
    const sessionExtra = window.__MOCK_INSCRICOES__ || [];
    return [...sessionExtra, ...mockDataset()];
  }

  const res = await fetch(CONFIG.BASE_URL + CONFIG.ENDPOINTS.LISTAR_INSCRICOES);
  if (!res.ok) throw new Error('Não foi possível carregar as inscrições.');
  return res.json();
}

async function removerInscricao(id) {
  if (typeof CONFIG !== 'undefined' && CONFIG.MOCK_MODE) {
    await new Promise(r => setTimeout(r, 300));
    return true;
  }
  const res = await fetch(`${CONFIG.BASE_URL}${CONFIG.ENDPOINTS.REMOVER_INSCRICAO}/${id}`, { method: 'DELETE' });
  return res.ok;
}

// -------------------------------------------------------------
// Render
// -------------------------------------------------------------
function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function populateCidadeFilter(items) {
  const cidades = [...new Set(items.map(i => i.cidade).filter(Boolean))].sort();
  cidadeFilter.innerHTML = '<option value="">Todas as cidades</option>' +
    cidades.map(c => `<option value="${c}">${c}</option>`).join('');
}

function renderStats(items) {
  document.getElementById('statTotal').textContent = items.length;
  const pessoas = items.reduce((acc, i) => acc + 1 + (Number(i.acompanhantes) || 0), 0);
  document.getElementById('statPessoas').textContent = pessoas;
  document.getElementById('statCidades').textContent = new Set(items.map(i => i.cidade).filter(Boolean)).size;
  const hoje = new Date().toDateString();
  document.getElementById('statHoje').textContent = items.filter(i => new Date(i.criado_em).toDateString() === hoje).length;
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
      <td>${escapeHtml(i.nome)}<br><span class="badge">${escapeHtml(i.email || '')}</span></td>
      <td>${escapeHtml(i.telefone || '')}</td>
      <td>${escapeHtml(i.cidade || '')}</td>
      <td>${escapeHtml(i.modelo || '')}${i.cor ? ' — ' + escapeHtml(i.cor) : ''}</td>
      <td class="num">${i.ano || ''}</td>
      <td>${escapeHtml(i.cor || '—')}</td>
      <td class="num">${i.acompanhantes ?? 0}</td>
      <td>${formatDate(i.criado_em)}</td>
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
  const cidade = cidadeFilter.value;
  const filtered = allInscricoes.filter(i => {
    const matchesTerm = !term || [i.nome, i.modelo, i.cidade, i.email].some(v => (v || '').toLowerCase().includes(term));
    const matchesCidade = !cidade || i.cidade === cidade;
    return matchesTerm && matchesCidade;
  });
  renderTable(filtered);
}

async function loadInscricoes() {
  tableLoading.style.display = 'block';
  dataTable.style.display = 'none';
  tableEmpty.style.display = 'none';

  try {
    allInscricoes = await fetchInscricoes();
    allInscricoes.sort((a, b) => new Date(b.criado_em) - new Date(a.criado_em));
    populateCidadeFilter(allInscricoes);
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
cidadeFilter.addEventListener('change', applyFilters);
document.getElementById('refreshBtn').addEventListener('click', loadInscricoes);

// -------------------------------------------------------------
// Exportar CSV
// -------------------------------------------------------------
document.getElementById('exportBtn').addEventListener('click', () => {
  if (!allInscricoes.length) return;
  const headers = ['id', 'nome', 'telefone', 'email', 'cidade', 'modelo', 'ano', 'cor', 'placa', 'acompanhantes', 'criado_em'];
  const rows = allInscricoes.map(i => headers.map(h => `"${String(i[h] ?? '').replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `inscricoes-autos-antigos-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});
