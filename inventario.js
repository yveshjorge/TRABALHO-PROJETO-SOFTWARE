const express = require('express');
const app = express();
app.use(express.json());

// Simulação de base de dados em memória
const stock = { 'PROD-001': 50, 'PROD-002': 5 };

app.post('/api/inventario/reserva', (req, res) => {
    const { produtoId, quantidade } = req.body;
    console.log(`[Legado - Inventário] Recebida verificação para ${produtoId}`);
    
    if (stock[produtoId] >= quantidade) {
        stock[produtoId] -= quantidade;
        return res.json({ status: 'SUCESSO', mensagem: 'Stock reservado.', stockAtual: stock[produtoId] });
    }
    return res.json({ status: 'ERRO', mensagem: 'Stock insuficiente.' });
});

app.listen(3001, () => console.log('[Sistema Legado] Inventário a correr na porta 3001'));