const { test } = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

function portaAberta(porta) {
    return new Promise((resolve, reject) => {
        const socket = net.connect({ host: '127.0.0.1', port: porta });
        socket.setTimeout(300);
        socket.once('connect', () => { socket.destroy(); resolve(true); });
        socket.once('timeout', () => { socket.destroy(); reject(new Error(`Timeout ao conferir porta ${porta}`)); });
        socket.once('error', erro => {
            socket.destroy();
            if (erro.code === 'ECONNREFUSED') resolve(false);
            else reject(erro);
        });
    });
}

async function iniciar(nome, porta) {
    const processo = spawn(process.execPath, [path.join(__dirname, '..', `${nome}.js`)], {
        env: process.env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true
    });
    const servico = { processo, logs: '', erro: null };
    processo.stdout.on('data', dados => { servico.logs += dados; });
    processo.stderr.on('data', dados => { servico.logs += dados; });
    processo.on('error', erro => { servico.erro = erro; });
    try {
        for (let tentativa = 0; tentativa < 100; tentativa++) {
            if (servico.erro) throw servico.erro;
            if (processo.exitCode !== null) throw new Error(servico.logs);
            if (await portaAberta(porta)) return servico;
            await delay(50);
        }
        throw new Error(`Servidor ${nome} nao iniciou: ${servico.logs}`);
    } catch (erro) {
        await parar(servico);
        throw erro;
    }
}

async function parar(servico) {
    const processo = servico.processo;
    if (processo.exitCode !== null || processo.signalCode !== null || servico.erro) return;
    await new Promise(resolve => {
        processo.once('exit', resolve);
        processo.kill();
    });
}

async function enviar(corpo, literal = false) {
    const resposta = await fetch('http://127.0.0.1:3000/api/esb/processar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: literal ? corpo : JSON.stringify(corpo),
        signal: AbortSignal.timeout(8000)
    });
    return { status: resposta.status, dados: await resposta.json() };
}

test('integracao SOA com os tres processos reais', { timeout: 30000 }, async t => {
    // Evita interagir com servidores de demonstracao ou encerrar processos alheios.
    for (const porta of [3000, 3001, 3002]) {
        assert.equal(await portaAberta(porta), false, `Porta ${porta} ocupada. Pare os servidores antes de executar npm test.`);
    }
    const servicos = [];
    try {
        const inventario = await iniciar('inventario', 3001); servicos.push(inventario);
        const vendas = await iniciar('vendas', 3002); servicos.push(vendas);
        const esb = await iniciar('esb', 3000); servicos.push(esb);
        const contrato = { produtoId: 'PROD-001', quantidade: 2, clienteId: '987', valorTotal: 150 };

        await t.test('reserva precede Vendas e retorna estoque 48', async () => {
            const { status, dados } = await enviar(contrato);
            assert.equal(status, 201);
            assert.equal(dados.status, 'SUCESSO');
            assert.equal(dados.inventario.stockAtual, 48);
            assert.equal(dados.venda.status, 'SUCESSO');
            assert.equal(dados.venda.valor, 150);
            assert.match(dados.venda.id, /^TXN-/);
            assert.equal(typeof dados.requisicaoId, 'string');
            await delay(50);
            const inicio = esb.logs.indexOf('1. Contrato validado');
            const reserva = esb.logs.indexOf('2. Reserva confirmada');
            const fim = esb.logs.indexOf('3. Venda confirmada');
            assert.ok(inicio >= 0 && reserva > inicio && fim > reserva);
        });

        await t.test('estoque insuficiente interrompe antes de Vendas', async () => {
            await delay(50);
            const antes = vendas.logs;
            const { status, dados } = await enviar({ ...contrato, produtoId: 'PROD-002', quantidade: 6 });
            assert.equal(status, 409);
            assert.equal(dados.etapa, 'INVENTARIO');
            await delay(50);
            assert.equal(vendas.logs, antes);
        });

        await t.test('contrato invalido nao chama legados', async () => {
            await delay(50);
            const antes = [inventario.logs, vendas.logs];
            for (const quantidade of [0, -1, 1.5, '2']) {
                assert.equal((await enviar({ ...contrato, quantidade })).status, 400);
            }
            await delay(50);
            assert.deepEqual([inventario.logs, vendas.logs], antes);
        });

        await t.test('JSON malformado retorna HTTP 400', async () => {
            const resposta = await enviar('{', true);
            assert.equal(resposta.status, 400);
            assert.equal(resposta.dados.mensagem, 'JSON invalido.');
        });

        await t.test('Vendas indisponivel informa reserva parcial', async () => {
            await parar(vendas);
            const { status, dados } = await enviar(contrato);
            assert.equal(status, 502);
            assert.equal(dados.etapa, 'VENDAS');
            assert.equal(dados.reservaConfirmada, true);
        });

        await t.test('Inventario indisponivel interrompe na primeira etapa', async () => {
            await parar(inventario);
            await delay(50);
            const antes = esb.logs.split('2. Reserva confirmada').length;
            const { status, dados } = await enviar(contrato);
            assert.equal(status, 502);
            assert.equal(dados.etapa, 'INVENTARIO');
            assert.equal(dados.reservaConfirmada, false);
            await delay(50);
            assert.equal(esb.logs.split('2. Reserva confirmada').length, antes);
        });
    } finally {
        for (const servico of servicos.reverse()) await parar(servico);
    }
});
