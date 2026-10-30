const express = require('express');
const axios = require('axios');
const { randomUUID } = require('node:crypto');
const path = require('node:path');
const app = express();

// Permite utilizar o index.html local da PoC, sem depender do pacote cors.
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});
app.use(express.json({ limit: '16kb' }));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/health', (req, res) => res.json({ status: 'ONLINE', servico: 'ESB' }));

const http = axios.create({ timeout: 5000, proxy: false });

app.post('/api/esb/processar', async (req, res) => {
    const { produtoId, quantidade, clienteId, valorTotal } = req.body || {};
    if (typeof produtoId !== 'string' || !produtoId.trim() ||
        !Number.isSafeInteger(quantidade) || quantidade <= 0 ||
        typeof clienteId !== 'string' || !clienteId.trim() ||
        !Number.isFinite(valorTotal) || valorTotal <= 0) {
        return res.status(400).json({
            status: 'ERRO',
            mensagem: 'Informe produtoId e clienteId como textos nao vazios, quantidade inteira positiva e valorTotal numerico positivo.'
        });
    }

    const requisicaoId = randomUUID();
    const config = { headers: { 'X-Request-ID': requisicaoId } };
    let etapa = 'INVENTARIO';
    let reservaConfirmada = false;
    const log = mensagem => console.log(`[ESB ${requisicaoId}] ${mensagem}`);

    try {
        log('1. Contrato validado; chamando Inventario na porta 3001.');
        const inventario = await http.post(
            'http://localhost:3001/api/inventario/reserva',
            { produtoId, quantidade }, config
        );
        if (inventario.data?.status === 'ERRO') {
            log('2. Inventario recusou a reserva; Vendas nao sera chamado.');
            return res.status(409).json({
                status: 'ERRO', requisicaoId, etapa,
                mensagem: inventario.data.mensagem
            });
        }
        if (inventario.data?.status !== 'SUCESSO') {
            throw new Error('Resposta inesperada do Inventario.');
        }

        reservaConfirmada = true;
        etapa = 'VENDAS';
        log('2. Reserva confirmada; chamando Vendas na porta 3002.');
        const vendas = await http.post(
            'http://localhost:3002/api/vendas/registrar',
            { produtoId, quantidade, clienteId, valorTotal }, config
        );
        if (vendas.data?.status !== 'SUCESSO') {
            throw new Error('Vendas nao confirmou o registro.');
        }

        log('3. Venda confirmada; devolvendo resultado ao cliente.');
        return res.status(201).json({
            status: 'SUCESSO', requisicaoId,
            mensagem: 'Reserva e venda confirmadas.',
            inventario: inventario.data,
            venda: vendas.data
        });
    } catch (erro) {
        const timeout = ['ECONNABORTED', 'ETIMEDOUT'].includes(erro.code);
        log(`Falha na etapa ${etapa}: ${erro.code || erro.message}`);
        return res.status(timeout ? 504 : 502).json({
            status: 'ERRO', requisicaoId, etapa, reservaConfirmada,
            mensagem: `Nao foi possivel confirmar a etapa ${etapa}.`,
            observacao: 'Nao ha rollback automatico. Em falhas de comunicacao, confira os efeitos nos legados antes de repetir a operacao.'
        });
    }
});

app.use((erro, req, res, next) => {
    if (erro.type === 'entity.parse.failed') {
        return res.status(400).json({ status: 'ERRO', mensagem: 'JSON invalido.' });
    }
    const status = erro.status === 413 ? 413 : 500;
    return res.status(status).json({ status: 'ERRO', mensagem: 'Falha ao processar a requisicao.' });
});

app.listen(3000, () => console.log('[Barramento SOA] ESB ativo na porta 3000'));
