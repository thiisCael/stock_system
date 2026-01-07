import pool from '../config/db.js';

// --- FUNÇÕES DE PRODUTOS ---

export const upsertProduct = async (nome, categoria, sku, quantidade, lote, data_vencimento) => {
    try {
        // 🛡️ PROTEÇÃO 1: Validar campos obrigatórios
        if (!nome || !sku || !lote) {
            throw new Error('Nome, SKU e Lote são obrigatórios');
        }

        // 🛡️ PROTEÇÃO 2: Converter data para formato PostgreSQL (YYYY-MM-DD)
        let dataFormatada = null;
        if (data_vencimento) {
            // Aceita DD/MM/YYYY, YYYY-MM-DD ou objeto Date
            const [dia, mes, ano] = data_vencimento.includes('/') 
                ? data_vencimento.split('/')
                : data_vencimento.split('-').reverse();
            dataFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
        }

        // 🛡️ PROTEÇÃO 3: Garantir quantidade como número
        const qtd = parseInt(quantidade) || 0;

        // Verificar se produto já existe (mesmo SKU + LOTE)
        const existente = await pool.query(
            'SELECT id, saldo_atual FROM produtos WHERE sku = $1 AND lote = $2', 
            [sku, lote]
        );

        if (existente.rows.length > 0) {
            // CASO 1: Produto existe → SOMAR quantidade
            const res = await pool.query(
                'UPDATE produtos SET saldo_atual = saldo_atual + $1 WHERE id = $2 RETURNING *',
                [qtd, existente.rows[0].id]
            );
            return { 
                ...res.rows[0], 
                acao: 'atualizado',
                quantidade_adicionada: qtd 
            };
        } else {
            // CASO 2: Produto novo → INSERIR
            const res = await pool.query(
                `INSERT INTO produtos (nome, categoria, sku, saldo_atual, lote, data_vencimento, data_cadastro) 
                 VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE) RETURNING *`,
                [nome, categoria || 'Sem Categoria', sku, qtd, lote, dataFormatada]
            );
            return { 
                ...res.rows[0], 
                acao: 'criado' 
            };
        }
    } catch (error) {
        console.error('❌ ERRO NO UPSERT:', error.message);
        throw new Error(`Falha ao salvar produto: ${error.message}`);
    }
};

export const getAllProducts = async () => { 
    const res = await pool.query('SELECT * FROM produtos ORDER BY id ASC'); 
    return res.rows; 
};

// --- FUNÇÕES DE MOVIMENTAÇÃO ---

export const createMovement = async (produto_id, tipo, quantidade, responsavel) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 🛡️ PROTEÇÃO: Validar dados
        if (!produto_id || !tipo || !quantidade) {
            throw new Error('Produto, tipo e quantidade são obrigatórios');
        }

        const qtdNum = Number(quantidade);
        if (isNaN(qtdNum) || qtdNum <= 0) {
            throw new Error('Quantidade deve ser um número positivo');
        }

        // Normalizar tipo (remove acentos, converte para MAIÚSCULAS e remove espaços)
        const tipoLimpo = tipo.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

        // 🔥 MAPEAMENTO
        const mapeamentoTipos = {
            'ENTRADA': 'ENTRADA',
            'COMPRA': 'ENTRADA',
            'AJUSTE POSITIVO': 'ENTRADA',
            'SAIDA': 'SAIDA',
            'USO': 'SAIDA',
            'VENDA': 'SAIDA',
            'PERDA': 'SAIDA',
            'AJUSTE NEGATIVO': 'SAIDA',
            'RETORNO': 'RETORNO',        // ⬅️ DEVE TER ESTA LINHA
            'DEVOLUCAO': 'RETORNO'        // ⬅️ E ESTA LINHA
        };

        const tipoValido = mapeamentoTipos[tipoLimpo];

        if (!tipoValido) {
            throw new Error(`Tipo de movimentação inválido: ${tipo}. Use: ENTRADA, SAIDA ou RETORNO`);
        }

        // Determinar se soma ou subtrai
        const tiposSomam = ['ENTRADA', 'RETORNO'];  // ⬅️ RETORNO DEVE ESTAR AQUI
        const ajuste = tiposSomam.includes(tipoValido) ? qtdNum : -qtdNum;

        // Verificar se o produto existe e tem estoque suficiente (se for saída)
        const produto = await client.query(
            'SELECT saldo_atual FROM produtos WHERE id = $1',
            [produto_id]
        );

        if (produto.rows.length === 0) {
            throw new Error('Produto não encontrado');
        }

        if (ajuste < 0 && produto.rows[0].saldo_atual + ajuste < 0) {
            throw new Error(`Estoque insuficiente. Disponível: ${produto.rows[0].saldo_atual}`);
        }

        // Registrar movimentação (usando o tipo válido normalizado)
        await client.query(
            'INSERT INTO movimentacoes (produto_id, tipo, quantidade, responsavel, data_movimentacao) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)',
            [produto_id, tipoValido, qtdNum, responsavel || 'Sistema']
        );

        // Atualizar estoque
        await client.query(
            'UPDATE produtos SET saldo_atual = saldo_atual + $1 WHERE id = $2',
            [ajuste, produto_id]
        );

        await client.query('COMMIT');
        return { 
            success: true, 
            novo_saldo: produto.rows[0].saldo_atual + ajuste 
        };
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ ERRO NA MOVIMENTAÇÃO:', error.message);
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

export const searchMovements = async (filtros) => {
    const { data_inicio, data_fim, responsavel, produto_nome } = filtros;
    let query = `
        SELECT 
            m.id,
            m.tipo,
            m.quantidade,
            m.responsavel,
            TO_CHAR(m.data_movimentacao, 'DD/MM/YYYY HH24:MI') as data_movimentacao,
            p.nome as produto_nome, 
            p.lote,
            p.sku,
            p.saldo_atual
        FROM movimentacoes m
        JOIN produtos p ON m.produto_id = p.id
        WHERE 1=1
    `;
    const values = [];

    if (data_inicio && data_fim) {
        values.push(data_inicio, data_fim);
        query += ` AND m.data_movimentacao::date BETWEEN ${values.length - 1} AND ${values.length}`;
    }
    if (responsavel) {
        values.push(`%${responsavel}%`);
        query += ` AND m.responsavel ILIKE ${values.length}`;
    }
    if (produto_nome) {
        values.push(`%${produto_nome}%`);
        query += ` AND p.nome ILIKE ${values.length}`;
    }

    query += ` ORDER BY m.data_movimentacao DESC`;
    const res = await pool.query(query, values);
    return res.rows;
};