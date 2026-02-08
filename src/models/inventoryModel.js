import pool from '../config/db.js';

export const upsertProduct = async (
  nome,
  categoria,
  sku,
  quantidade,
  lote,
  data_vencimento
) => {
  try {
    //a logica de verificar se existe continua aqui
    const existente = await pool.query(
      'SELECT id, saldo_atual FROM produtos WHERE sku = $1 AND lote = $2',
      [sku, lote]
    );
    if (existente.rows.length > 0) {
      //atualizar
      const res = await pool.query(
        'UPDATE produtos SET saldo_atual = saldo_atual + $1 WHERE id = $2 RETURNING *',
        [quantidade, existente[0].id]
      );
      return {
        ...res.rows[0],
        acao: 'atualizado',
        quantidade_adicionada: quantidade,
      };
    } else {
      //criar
      const res = await pool.query(
        'INSERT INTO produtos (nome, categoria, sku, saldo_atual, lote, data_vencimento, data_cadastro) VALUES( $1,$2,$3,$4,$5,$6, CURRENT_DATE) RETURNING * ',
        [
          nome,
          categoria || 'Sem categoria',
          sku,
          quantidade,
          lote,
          data_vencimento,
        ]
      );
      return { ...res.rows[0], acao: 'criado' };
    }
  } catch (error) {
    throw new Error(`ERROR SQL:${error.message}`);
  }
};

// --- FUNÇÕES DE PRODUTOS ---

export const getAllProducts = async () => {
  try {
    const res = await pool.query('SELECT * FROM produtos ORDER BY id ASC');
    return res.rows;
  } catch (error) {
    throw new Error(`Erro ao buscar produtos: ${error.message}`);
  }
};

// --- FUNÇÕES DE MOVIMENTAÇÃO ---
export const createMovement = async (
  produto_id,
  tipo,
  quantidade,
  responsavel
) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN'); //INICIA a transação segura

    //define se soma ou sbtrai
    //service ja garantiu que 'tipo' é valido(entrada saida ou retorno )
    const tiposQueSomam = ['ENTRADA', 'RETORNO'];
    const fator = tiposQueSomam.includes(tipo) ? 1 : -1;
    const ajuste = quantidade * fator;

    //verifica saldo(para saida)
    if (fator === -1) {
      const produto = await client.query(
        'SELECT saldo_atual FROM produtos WHERE id = $1',
        [produto_id]
      );

      if (produto.rows.length === 0) throw new Error('Produto não encontrado');

      const saldoAtual = produto.rows[0].saldo_atual;
      if (saldoAtual + ajuste < 0) {
        throw new Error(`Estoque insuficiente. Disponível: ${saldoAtual}`);
      }
    }
    //registra historico
    await client.query(
      'INSERT INTO movimentacoes(produto_id, tipo, quantidade, responsavel, data_movimentacao) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
      [produto_id, tipo, quantidade, responsavel || 'Sistema']
    );
    //atualiza o saldo
    await client.query(
      'UPDATE produtos SET saldo_atual = saldo_atual + $1 WHERE id = $2',
      [ajuste, produto_id]
    );
    await client.query('COMMIT'); //confirma tudo
    return { sucess: true };
  } catch (error) {
    await client.query('ROLLBACK'); //se der ruim, desfaz
    throw error;
  } finally {
    client.release();
  }
};

export const getAllMovements = async () => {
  const res = await pool.query(`
        SELECT 
            m.id,
            m.tipo,
            m.quantidade,
            m.responsavel,
            m.data_movimentacao,
            p.nome as produto_nome, 
            p.lote, 
            p.sku,
            p.saldo_atual
        FROM movimentacoes m 
        JOIN produtos p ON m.produto_id = p.id 
        ORDER BY m.data_movimentacao DESC 
    `);
  return res.rows;
};

export const searchMovements = async filtros => {
  const { data_inicio, data_fim, responsavel, produto_nome } = filtros;

  //começamos selecionando tudo
  let query = `
        SELECT m.*, p.nome as produto_nome, p.sku FROM movimentacoes m 
        LEFT JOIN produtos p ON m.produto_id = p.id WHERE 1=1
    `;

  const params = [];
  let count = 1;

  //se tiver data de inicio
  if (data_inicio) {
    query += ` AND m.data_movimentacao >= $${count}`;
    params.push(`${data_inicio} 00:00:00`);
    count++; 
  }
  //se tiver data fim
  if (data_fim) {
    query += ` AND m.data_movimentacao <= $${count}`;
    params.push(`${data_fim} 23:59:59`); //pega até o ultimo segundo do dia
    count++;
  }

  if (responsavel) {
    query += `AND m.responsavel ILIKE $${count}`; //ILIKE ignora maiusculas
    params.push(`%${responsavel}%`);
    count++;
  }

  if (produto_nome) {
    params.push(`%${produto_nome}%`);
    query += ` AND p.nome ILIKE $${count}`;
    count++;
  }

  query += ` ORDER BY m.data_movimentacao DESC `;

  try {
    const res = await pool.query(query, params);
    return res.rows;
  } catch (error) {
    throw new Error(`Erro no filtro: ${error.message}`);
  }
};
