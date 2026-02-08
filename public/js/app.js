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
window.filtrarRelatorio = async (btn) => {
  // --- TRAVA DE SEGURANÇA (O Pulo do Gato) ---
  // Se o botão não existe, OU está desabilitado, OU já está escrito "Filtrando..."
  // O código PARA aqui e não faz nada. Isso evita o travamento.
  if (!btn || btn.disabled || btn.innerText === 'Filtrando...') return;

  const textoOriginal = btn.innerText;

  try {
    // 1. Bloqueia o botão
    btn.innerText = 'Filtrando...';
    btn.disabled = true;

    // 2. Pega os valores dos inputs
    const filtros = {
      data_inicio: document.getElementById('filterDate').value,
      // Dica: Se quiser filtrar o dia exato, repita a data no fim
      data_fim: document.getElementById('filterDate').value, 
      produto_nome: document.getElementById('filterProduto').value,
      responsavel: document.getElementById('filterResponsavel').value,
    };

    // 3. Chama a API
    const dados = await api.buscarRelatorio(filtros);
    
    // 4. Atualiza a tela
    dom.renderTabelaMovimentacoes(dados);

  } catch (error) {
    console.error(error);
    alert("Erro ao filtrar: " + error.message);
  } finally {
    // 5. DESTRAVA O BOTÃO (Sempre acontece, dando erro ou não)
    if (btn) {
      btn.innerText = textoOriginal; // Volta para "Filtrar"
      btn.disabled = false;          // Libera o clique
    }
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

window.verificarLimpeza = (elementoInput) => {
    // Se o campo ficou vazio (usuário apagou tudo)
    if (elementoInput.value === "") {
        // Procura o botão de filtrar na tela
        const btn = document.querySelector('button[onclick*="filtrarRelatorio"]');
        
        // Se achou o botão, clica nele para recarregar a tabela
        if (btn) {
            window.filtrarRelatorio(btn);
        }
    }
};
// Começa o show
init();
