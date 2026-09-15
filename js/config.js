/**
 * CONFIGURAÇÃO DA API
 * -----------------------------------------------------------------
 * Backend: evento_maconaria (Laravel / api.php).
 * Rotas ativas: POST /login · POST /visitors (público) ·
 * GET/PUT/DELETE /visitors (auth:sanctum, Bearer token).
 * -----------------------------------------------------------------
 */
const CONFIG = {
  BASE_URL: "https://autosantigoseaceitosbackend.onrender.com/api",

  ENDPOINTS: {
    // POST — envia uma nova inscrição de visitante.
    // Body: { name, email, phone_number, additional_visitors: [] }
    CRIAR_INSCRICAO: "/visitors",

    // GET — lista todas as inscrições (painel admin, autenticado)
    LISTAR_INSCRICOES: "/visitors",

    // DELETE /visitors/:id — remove uma inscrição (admin)
    REMOVER_INSCRICAO: "/visitors",

    // POST — login do admin. Body: { email, password }
    // Retorna { token, user }
    LOGIN_ADMIN: "/login",
  },

  // Backend no ar; desativando o modo de demonstração.
  MOCK_MODE: false,
};