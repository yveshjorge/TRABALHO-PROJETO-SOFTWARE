const express = require('express');
const app = express();
app.use(express.json());

app.post('/api/vendas/registrar', (req, res) => {
    const { produtoId, quantidade, valorTotal } = req.body;
    console.log(`[Legado - Vendas] A registar nova venda...`);
    
    // Simulação do registo na base de dados financeira
    const transacaoId = `TXN-${Date.now()}`;
    
    res.json({
        status: 'SUCESSO',
        mensagem: 'Venda registada com sucesso.',
        id: transacaoId,
        valor: valorTotal
    });
});

app.listen(3002, () => console.log('[Sistema Legado] Vendas a correr na porta 3002'));