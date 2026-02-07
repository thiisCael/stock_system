import * as InventoryModel from '../models/inventoryModel.js';

class InventoryService {
  async listarProdutos() {
    return await InventoryModel.getAllProducts();
  }

  async listarMovimentacao() {
    return await InventoryModel.getAllMovements();
  }

  async adicionarProduto(dados) {
    const nome = dados.nome;
    const categoria = dados.categoria;
    const sku = dados.sku;
    const quantidade = parseInt(
      dados.quantidade_inicial || dados.quantidade || 0
    );
    const lote = dados.lote;
    const data_vencimento = dados.vencimento || dados.data_vencimento;

    if (!nome || !sku || !lote) {
      throw new Error('Regra de Negócio: Nome, SKU e Lote são obrigatórios.');
    }

    let dataFormatada = null;
    if (data_vencimento) {
      const [dia, mes, ano] = data_vencimento.includes('/')
        ? data_vencimento.split('/')
        : data_vencimento.split('-').reverse();
      dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
    }

    return await InventoryModel.upsertProduct(
      nome,
      categoria,
      sku,
      quantidade,
      lote,
      dataFormatada
    );
  }

  async registrarMovimentacao(dados) {
    // 1. Resgate Robusto dos dados
    const produto_id = dados.produto_id || dados.produtoId;
    const quantidade = dados.quantidade || dados.qtd;
    const responsavel = dados.responsavel;
    const tipoCru =
      dados.tipo || dados.Tipo || dados.TIPO || dados['tipo '] || '';

    // 2. Validação Básica
    if (!produto_id || !tipoCru || !quantidade) {
      throw new Error(
        'Dados incompletos! Verifique Produto, Tipo e Quantidade.'
      );
    }

    const qtdNum = Number(quantidade);
    if (isNaN(qtdNum) || qtdNum <= 0) {
      throw new Error('Quantidade deve ser um número positivo.');
    }

    // 3. Normalização e Mapeamento
    const tipoLimpo = String(tipoCru)
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();

    const mapeamentoTipos = {
      ENTRADA: 'ENTRADA',
      COMPRA: 'ENTRADA',
      'AJUSTE POSITIVO': 'ENTRADA',
      SAIDA: 'SAIDA',
      VENDA: 'SAIDA',
      USO: 'SAIDA',
      PERDA: 'SAIDA',
      RETORNO: 'RETORNO',
      DEVOLUCAO: 'RETORNO',
    };

    const tipoValido = mapeamentoTipos[tipoLimpo];

    if (!tipoValido) {
      throw new Error(
        `Tipo de movimentação inválido. Use: Entrada, Saída ou Devolução.`
      );
    }

    // 4. Execução Segura
    return await InventoryModel.createMovement(
      produto_id,
      tipoValido,
      qtdNum,
      responsavel
    );
  
  }

  async gerarRelatorio(filtros){ 
    //remove campos vazios 
    const filtrosLimpos = { }; 
    for(const key in filtros){ 
      if(filtros[key] && filtros[key] !== ''){ 
        filtrosLimpos[key] = filtros[key];
      }
    }
    //se nao sobrou nenhum filtro, retorne tudo 
    if(Object.keys(filtrosLimpos).length === 0){ 
      return await InventoryModel.getAllMovements(); 
    }
    return await InventoryModel.searchMovements(filtrosLimpos); 
  }
}

export const inventoryService = new InventoryService();
