import { inventoryService } from '../service/inventoryService.js';

export const getProducts = async (req, res) => {
  try {
    const produtos = await inventoryService.listarProdutos();
    res.json(produtos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const addProduct = async (req, res) => {
  try {
    console.log('Recebido:', req.body); //log para debug

    //o controller apenas pega o body e jogo para o serviço
    const resultado = await inventoryService.adicionarProduto(req.body);
    res.status(201).json(resultado);
  } catch (error) {
    //se der erro(400 ou 500 validação do sevice)
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

export const getMovements = async (req, res) => {
  try {
    const movements = await inventoryService.listarMovimentacao();
    res.json(movements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const postMovement = async (req, res) => {
 try{ 
  //o console ajuda a gente ver se front mandou certo 
  console.log("CONTROLER RECEBEU: ", req.body); 

  //chamamos o service(que valida se pode sair, se o tipo tá certo, etc)
  await inventoryService.registrarMovimentacao(req.body); 
  //se nao deu certo no await acima, significa que salvou! 
  res.status(201).json({message: "Movimentação registrada com sucesso"}); 
 }catch(error) { 
  //se o service reclamar estoque insuficiente a gente manda o erro 400 pro front 
  console.error(error); //mostra o erro no seu terminal pra ajudar 
  res.status(400).json({error: error.message}); 
 }
};

export const getReport = async (req, res) => { 
  try{ 
    //passamos o que veio na URL(req.query) para o serviço 
    const report = await inventoryService.gerarRelatorio(req.query); 
    res.json(report); 
  }catch(error) { 
    console.error("Erro no relatorio", error)
    res.status(500).json({error: error.message}); 
  }
}
