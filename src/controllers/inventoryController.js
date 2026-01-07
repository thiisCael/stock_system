import * as InventoryModel from '../models/inventoryModel.js';

export const getProducts = async (req, res) => {
    try {
        const produtos = await InventoryModel.getAllProducts();
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ESTE É O NOVO ADDPRODUCT (Substitui o salvarProduto e o antigo addProduct)
export const addProduct = async (req, res) => {
    
    console.log("Dados recebidos no backend:", req.body);
    
    // 🔥 CORREÇÃO: Aceitar os nomes que o frontend está enviando
    const nome = req.body.nome;
    const categoria = req.body.categoria;
    const sku = req.body.sku;
    const quantidade = req.body.quantidade_inicial || req.body.quantidade; // Aceita os 2 nomes
    const lote = req.body.lote;
    const data_vencimento = req.body.vencimento || req.body.data_vencimento; // Aceita os 2 nomes

    console.log("📦 Valores extraídos:", { nome, categoria, sku, quantidade, lote, data_vencimento });

    try {
        if (!nome || !sku || !lote) {
            return res.status(400).json({ error: "Nome, SKU e Lote são obrigatórios." });
        }

        // A lógica de "Somar se existir ou Criar novo" deve ficar no Model para manter o MVC limpo
       const result = await InventoryModel.upsertProduct(
    nome, 
    categoria, 
    sku, 
    parseInt(quantidade) || 0, 
    lote, 
    data_vencimento
); 

        res.status(201).json(result);
    } catch (error) {
        console.error("ERRO NO BANCO:", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const getMovements = async (req, res) => {
    try {
        const movements = await InventoryModel.getAllMovements();
        res.json(movements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postMovement = async (req, res) => {
    const { produto_id, tipo, quantidade, responsavel } = req.body;
    try {
        // O Model deve cuidar da transação (Registrar movimento + Alterar estoque)
        await InventoryModel.createMovement(produto_id, tipo, quantidade, responsavel);
        res.status(201).json({ message: "Movimentação registrada com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getReport = async (req, res) => {
    try {
        const { data_inicio, data_fim, responsavel, produto_nome } = req.query;
        
        // Se houver algum filtro, usa a função searchMovements, senão usa getAllMovements
        let movimentacoes;
        if (data_inicio || data_fim || responsavel || produto_nome) {
            movimentacoes = await InventoryModel.searchMovements({ 
                data_inicio, data_fim, responsavel, produto_nome 
            });
        } else {
            movimentacoes = await InventoryModel.getAllMovements();
        }

        res.json(movimentacoes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};