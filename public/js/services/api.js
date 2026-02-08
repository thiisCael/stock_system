const API_URL = '/api';

export const api = {
  async buscarProdutos() {
    const res = await fetch(`${API_URL}/produtos`);
    return await res.json();
  },

  async buscarMovimentacoes() {
    const res = await fetch(`${API_URL}/movimentacoes`);
    return await res.json();
  },
  async buscarRelatorio(filtros) {
    //transforma objeto {a:1, b:2} em string
    const params = new URLSearchParams(filtros).toString();
    const res = await fetch(`${API_URL}/relatorios/pesquisa?${params}`);
    if (!res.ok) throw new Error('Erro ao buscar relatorio');
    return await res.json();
  },

  async salvarProduto(dados) {
    const res = await fetch(`${API_URL}/produtos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!res.ok) throw new Error('Erro ao salvar produto');
    return await res.json();
  },
  async salvarMovimentacao(dados) {
    const res = await fetch(`${API_URL}/movimentacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Erro ao salvar');
    return json;
  },
};
