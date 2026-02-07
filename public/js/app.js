import { api } from './services/api.js';
import { dom } from './ui/dom.js';

// --- Inicialização ---
async function init() {
  try {
    const [produtos, movimentos] = await Promise.all([
      api.buscarProdutos(),
      api.buscarMovimentacoes(),
    ]);

    dom.renderTabelaEstoque(produtos);
    dom.renderSelectProdutos(produtos);
    dom.renderTabelaMovimentacoes(movimentos);
  } catch (error) {
    console.error(error);
    alert('Erro ao carregar sistema.');
  }
}

// --- Eventos (Cliques e Envios) ---

// 1. Filtros
window.filtrarRelatorio = async () => {
  const btn = document.querySelector('button[onclick="filtrarRelatorio()"]');
  const textoOriginal = btn.innerText;
  btn.innerText = 'Filtrando...';

  const filtros = {
    data_inicio: document.getElementById('filterDate').value,
    data_fim: document.getElementById('filterDate').value, // Ajuste conforme sua lógica
    produto_nome: document.getElementById('filterProduto').value,
    responsavel: document.getElementById('filterResponsavel').value,
  };

  try {
    const dados = await api.buscarRelatorio(filtros);
    dom.renderTabelaMovimentacoes(dados);
  } catch (error) {
    alert(error.message);
  } finally {
    btn.innerText = textoOriginal;
  }
};

// 2. Salvar Produto
document.getElementById('prodForm').addEventListener('submit', async e => {
  e.preventDefault();
  const dados = {
    nome: document.getElementById('nome').value,
    categoria: document.getElementById('categoria').value,
    sku: document.getElementById('sku').value,
    lote: document.getElementById('lote').value,
    vencimento: document.getElementById('vencimento').value,
    quantidade_inicial: document.getElementById('qtd_ini').value,
  };

  try {
    await api.salvarProduto(dados);
    alert('Produto Salvo!');
    e.target.reset();
    init(); // Recarrega tudo
  } catch (error) {
    alert(error.message);
  }
});

// 3. Salvar Movimentação
document.getElementById('movForm').addEventListener('submit', async e => {
  e.preventDefault();
  const dados = {
    produto_id: document.getElementById('prodSelect').value,
    tipo: document.getElementById('tipoMov').value,
    quantidade: document.getElementById('qtdMov').value,
    responsavel: document.getElementById('resp').value,
  };

  try {
    await api.salvarMovimentacao(dados);
    alert('Movimentação Registrada!');
    e.target.reset();
    init(); // Recarrega tudo
  } catch (error) {
    alert(error.message);
  }
});

// Começa o show
init();
