/**
 * CONFIGURAÇÃO DA API
 * -----------------------------------------------------------------
 * Troque BASE_URL pela URL do backend quando ele estiver pronto.
 * Os caminhos abaixo são sugestões — ajuste para bater com os
 * endpoints reais que você vai me passar.
 * -----------------------------------------------------------------
 */
const CONFIG = {
  BASE_URL: "https://SEU-BACKEND-AQUI.com/api",

  ENDPOINTS: {
    // POST — envia uma nova inscrição. Body esperado: ver js/inscricao.js
    CRIAR_INSCRICAO: "/inscricoes",

    // GET — lista todas as inscrições (painel admin)
    LISTAR_INSCRICOES: "/inscricoes",

    // GET — estatísticas rápidas (total, por cidade, etc). Opcional:
    // se o backend não tiver essa rota, o admin calcula localmente
    // a partir de LISTAR_INSCRICOES.
    ESTATISTICAS: "/inscricoes/stats",

    // DELETE /inscricoes/:id — remove uma inscrição (admin)
    REMOVER_INSCRICAO: "/inscricoes",

    // POST — login do admin. Body: { usuario, senha }
    // Espera receber algo como { token: "..." }
    LOGIN_ADMIN: "/admin/login",
  },

  // Enquanto o backend não está no ar, MOCK_MODE = true faz o site
  // funcionar com dados fictícios em memória (não persiste ao recarregar
  // a página). Troque para false assim que os endpoints reais existirem.
  MOCK_MODE: true,
};
