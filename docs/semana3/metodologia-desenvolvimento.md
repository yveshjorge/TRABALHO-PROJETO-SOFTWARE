# Metodologia e Desenvolvimento

O trabalho adotou uma abordagem aplicada e experimental, mediante a construção de uma prova de conceito destinada a demonstrar a integração de sistemas por meio de um mediador. O ambiente foi composto por três aplicações Node.js executadas em processos separados, utilizando Express para exposição das interfaces HTTP e Axios para comunicação entre o barramento e os sistemas integrados.

Os sistemas de Inventário e Vendas representam aplicações legadas com responsabilidades específicas. O Inventário, executado na porta 3001, mantém uma estrutura de estoque em memória e disponibiliza `POST /api/inventario/reserva`. Vendas, na porta 3002, disponibiliza `POST /api/vendas/registrar`, simulando o registro de uma transação e retornando seu identificador. Não existe persistência em banco de dados nesta versão.

O mediador, executado na porta 3000, disponibiliza `POST /api/esb/processar`. Sua função consiste em receber uma solicitação unificada, validar sua estrutura e coordenar as chamadas aos sistemas legados. A interpretação do corpo JSON é configurada por middleware:

```javascript
app.use(express.json({ limit: '16kb' }));
```

O contrato contém `produtoId`, `quantidade`, `clienteId` e `valorTotal`. O mediador verifica identificadores textuais não vazios, quantidade inteira positiva e valor total numérico positivo. Solicitações incompatíveis são rejeitadas com HTTP 400 antes da comunicação com os legados. A necessidade de validar o corpo recebido é descrita na [documentação oficial do Express](https://expressjs.com/en/api/request.html).

A integração foi organizada em duas etapas sequenciais. Inicialmente, o mediador solicita a reserva ao Inventário, encaminhando somente os dados necessários à operação:

```javascript
const inventario = await http.post(
    'http://localhost:3001/api/inventario/reserva',
    { produtoId, quantidade }, config
);
```

A resposta é analisada tanto no nível de transporte quanto no nível de aplicação. O Inventário utiliza HTTP 200 mesmo quando informa `status: 'ERRO'`. Nessa situação, o barramento interrompe o fluxo e retorna HTTP 409. Vendas é chamado exclusivamente após a confirmação explícita da reserva:

```javascript
const vendas = await http.post(
    'http://localhost:3002/api/vendas/registrar',
    { produtoId, quantidade, clienteId, valorTotal }, config
);
```

Essa organização isola o consumidor dos endereços e das particularidades dos legados. A interface conhece apenas o contrato do barramento, enquanto o mediador conhece os destinos e coordena sua utilização. Inventário permanece responsável pelo estoque e Vendas pela simulação do registro financeiro. O legado de Vendas atual não utiliza `clienteId`, embora esse campo seja encaminhado pelo mediador.

As chamadas seguem um fluxo síncrono de requisição e resposta, implementado com `async/await`: cada etapa aguarda a anterior, sem bloquear globalmente a execução do Node.js. O cliente Axios possui timeout de cinco segundos, conforme recurso descrito na [documentação oficial](https://axios-http.com/docs/req_config):

```javascript
const http = axios.create({ timeout: 5000, proxy: false });
```

Falhas de comunicação são convertidas em respostas estruturadas que identificam a etapa afetada. O mediador gera um identificador por requisição, registra sua progressão e encaminha o identificador aos legados por `X-Request-ID`. Os legados atuais não registram esse cabeçalho.

A verificação funcional utiliza processos próprios e contempla processamento válido, estoque insuficiente, contrato inválido, JSON malformado e indisponibilidade de Vendas e Inventário. No cenário válido, a solicitação de duas unidades de `PROD-001` reduz o estoque de 50 para 48 e recebe confirmação de Vendas. A rejeição do Inventário interrompe a integração antes da chamada a Vendas. A execução pode ser reproduzida com `npm test`, com as portas 3000, 3001 e 3002 livres.

Os testes evidenciam uma limitação: a reserva de estoque e o registro da venda não constituem uma transação atômica. Se Vendas ficar indisponível após a reserva, o barramento informa a falha parcial, mas não desfaz a alteração. Os resultados demonstram comunicação funcional e controle sequencial; não comprovam desempenho sob carga ou disponibilidade em produção. O tratamento de timeout está implementado, mas não é exercitado por essa suíte.

Para o relatório final, devem ser incorporadas capturas reais da solicitação, da resposta integrada e dos terminais, conforme o [roteiro de gravação](roteiro-gravacao.md). Nenhuma captura ou medição deve ser apresentada como existente antes de sua coleta.
