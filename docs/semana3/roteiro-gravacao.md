# Guião de gravação da PoC

## 1. Preparação

Na pasta do projeto, execute `node --version` e `npm ci`. Exiba os arquivos `esb.js`, `inventario.js`, `vendas.js` e `index.html`. Não execute a suíte de testes enquanto os servidores da gravação estiverem ativos.

Fala: “A demonstração utiliza três processos: dois sistemas legados e um mediador responsável pela integração.”

## 2. Inicialização

Abra três terminais na pasta do projeto. No primeiro, execute `npm run start:inventario` e mostre a porta 3001. No segundo, execute `npm run start:vendas` e mostre a porta 3002. No terceiro, execute `npm start` e mostre a porta 3000. Organize os terminais de modo que suas mensagens sejam legíveis.

O Inventário recém-iniciado possui 50 unidades de `PROD-001` e cinco de `PROD-002`. Reiniciá-lo restaura esses valores, pois o armazenamento é em memória.

## 3. Cliente e contrato

Abra <http://localhost:3000> e as ferramentas do navegador na aba Rede/Network. O endpoint <http://localhost:3000/health> confirma apenas o ESB ativo; a operação seguinte comprova a comunicação entre os serviços.

Preencha e mostre o contrato:

```json
{
  "produtoId": "PROD-001",
  "quantidade": 2,
  "clienteId": "987",
  "valorTotal": 150
}
```

Alternativa de envio no PowerShell:

```powershell
$contrato = @{ produtoId = 'PROD-001'; quantidade = 2; clienteId = '987'; valorTotal = 150 } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/esb/processar' -Method Post -ContentType 'application/json' -Body $contrato
```

## 4. Operação válida

Clique em “Processar Venda via Barramento”. Mostre:

1. A solicitação do navegador para `POST /api/esb/processar`, na porta 3000, e o JSON enviado.
2. O registro do ESB indicando a chamada ao Inventário.
3. O terminal do Inventário confirmando o recebimento.
4. O registro do ESB indicando reserva confirmada e chamada a Vendas.
5. O terminal de Vendas indicando o registro.
6. A resposta HTTP 201, `status: 'SUCESSO'`, `stockAtual: 48` e o identificador `TXN-...`.

Fala: “O cliente envia uma solicitação ao barramento. O mediador aguarda a reserva e só então solicita o registro da venda.”

## 5. Estoque insuficiente

Envie `PROD-002`, quantidade 6, cliente e valor válidos. Mostre HTTP 409, a mensagem de estoque insuficiente, o registro de interrupção no ESB e a ausência de nova mensagem em Vendas. O legado respondeu HTTP 200 com um erro de negócio, que o ESB interpretou.

## 6. Contrato inválido

Envie quantidade zero. Mostre HTTP 400 e a ausência de novas chamadas nos legados. Explique que a validação ocorre antes da integração.

## 7. Falha de comunicação e resultado parcial

Interrompa apenas Vendas com `Ctrl+C`. Envie uma compra de uma unidade de `PROD-001`. Mostre a reserva no Inventário, a tentativa do ESB, HTTP 502, `etapa: 'VENDAS'` e `reservaConfirmada: true`.

Fala: “A reserva foi confirmada, mas Vendas está indisponível. A implementação informa a falha parcial; não existe rollback automático.”

Não reenvie automaticamente a mesma operação. Reinicie Vendas ao encerrar. Deixe esse cenário por último para preservar a previsibilidade das demonstrações anteriores.

## 8. Encerramento e evidências

Grave em resolução que permita ler os terminais e as respostas. Preserve o vídeo como contingência e faça capturas da requisição, do sucesso integrado e da rejeição por estoque. As chamadas do ESB aos legados são realizadas no servidor e não aparecem como requisições do navegador: use os logs dos processos para demonstrá-las.

Não apresente geração de identificador como prova de persistência financeira. Não afirme rollback, mensageria, Docker, alta disponibilidade ou testes de carga: esses recursos não fazem parte desta implementação.
