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
        
        if (movimentacoes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">Nenhum registro.</td></tr>';
            return;
        }

        tbody.innerHTML = movimentacoes.map(m => {
            const isSaida = ['SAIDA', 'VENDA', 'PERDA'].includes(m.tipo);
            const badgeClass = isSaida
                ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';

            return `
                <tr class="border-b border-slate-200 dark:border-slate-700">
                    <td class="p-3">${format.dataHora(m.data_movimentacao)}</td>
                    <td class="p-3 font-medium">${m.produto_nome || 'Produto Removido'}</td>
                    <td class="p-3"><span class="px-2 py-1 rounded text-xs font-bold ${badgeClass}">${m.tipo}</span></td>
                    <td class="p-3">${m.quantidade}</td>
                    <td class="p-3 italic">${m.responsavel}</td>
                </tr>
            `;
        }).join('');
    }
};