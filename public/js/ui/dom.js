import { format } from '../utils/format.js';

export const dom = {
    renderTabelaEstoque(produtos) {
        const tbody = document.getElementById('stockTableBody');
        tbody.innerHTML = produtos.map(p => {
            const corSaldo = p.saldo_atual <= 0 ? 'text-red-600' : 'text-slate-800 dark:text-slate-200';
            
            return `
                <tr class="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                    <td class="p-3 text-slate-800 dark:text-slate-200">${p.sku}</td>
                    <td class="p-3 font-medium text-slate-800 dark:text-slate-200">${p.nome}</td>
                    <td class="p-3 text-slate-600 dark:text-slate-400">${p.categoria}</td>
                    <td class="p-3 text-slate-600 dark:text-slate-400">${p.lote || '-'}</td>
                    <td class="p-3 text-slate-600 dark:text-slate-400">${format.data(p.data_vencimento)}</td>
                    <td class="p-3 font-bold ${corSaldo}">${p.saldo_atual}</td>
                </tr>
            `;
        }).join('');
    },

    renderSelectProdutos(produtos) {
        const select = document.getElementById('prodSelect');
        select.innerHTML = produtos.map(p => `
            <option value="${p.id}">
                ${p.nome} (SKU: ${p.sku}) ${p.lote ? '- Lote: ' + p.lote : ''}
            </option>
        `).join('');
    },

   renderTabelaMovimentacoes(movimentacoes) {
    const tbody = document.getElementById('movTableBody');
    tbody.innerHTML = '';

    // --- PARTE NOVA: ATUALIZA OS CARDS ---
    let totalEntrada = 0;
    let totalSaida = 0;

    // Calcula somando item por item
    movimentacoes.forEach(mov => {
        // Garante que é número (às vezes vem string do banco)
        const qtd = Number(mov.quantidade); 
        
        if (mov.tipo === 'ENTRADA' || mov.tipo === 'RETORNO') {
            totalEntrada += qtd;
        } else {
            totalSaida += qtd;
        }
    });

    // Joga os valores na tela
    document.getElementById('cardEntradas').innerText = totalEntrada;
    document.getElementById('cardSaidas').innerText = totalSaida;
    document.getElementById('cardSaldo').innerText = (totalEntrada - totalSaida);
    // -------------------------------------

    // Verifica se está vazio (o código que já tínhamos)
    if (movimentacoes.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-500">Nenhum registro encontrado 😕</td></tr>`;
        
        // Zera os cards se não tiver resultado
        document.getElementById('cardEntradas').innerText = "0";
        document.getElementById('cardSaidas').innerText = "0";
        document.getElementById('cardSaldo').innerText = "0";
        return;
    }

    // Renderiza as linhas
    movimentacoes.forEach(mov => {
        const tr = document.createElement('tr');
        tr.className = "border-b hover:bg-gray-50"; 
        
        // Formata a data bonitinha
        const dataFormatada = new Date(mov.data_movimentacao).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit'
        });

        tr.innerHTML = `
            <td class="p-3 text-sm text-gray-600">${dataFormatada}</td>
            <td class="p-3 text-sm font-medium text-gray-800">${mov.produto_nome || '-'}</td>
            <td class="p-3 text-sm">
                <span class="${mov.tipo === 'ENTRADA' || mov.tipo === 'RETORNO' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} px-2 py-1 rounded-full text-xs font-bold">
                    ${mov.tipo}
                </span>
            </td>
            <td class="p-3 text-sm font-bold text-center">${mov.quantidade}</td>
            <td class="p-3 text-sm text-gray-500 capitalize">${mov.responsavel}</td>
        `;
        tbody.appendChild(tr);
    });
}

    
};