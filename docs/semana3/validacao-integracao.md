# Registro de validação da integração

Data: 23 de outubro de 2026. Ambiente: Windows, Node.js v24.22.1, Express e Axios das dependências instaladas da PoC.

Comando equivalente para reprodução, após `npm ci`, com as três portas livres:

```powershell
npm test
```

A execução utiliza o executor nativo `node --test tests/integracao.test.js`. Os servidores são processos reais, iniciados e encerrados pela suíte. Nenhuma alteração persiste no estoque porque o armazenamento é em memória.

| Cenário | Resultado observado |
| --- | --- |
| Compra de duas unidades de PROD-001 | HTTP 201; stockAtual 48; venda com identificador TXN e valor 150; logs do ESB na ordem esperada |
| Seis unidades de PROD-002, com estoque cinco | HTTP 409; etapa INVENTARIO; sem nova chamada a Vendas |
| Quantidade zero, negativa, fracionária ou textual | HTTP 400; sem chamadas aos legados |
| JSON malformado | HTTP 400 e mensagem JSON invalido |
| Vendas interrompido após o cenário válido | HTTP 502; etapa VENDAS; reservaConfirmada true |
| Inventário interrompido | HTTP 502; etapa INVENTARIO; sem avanço para Vendas |

Resultado: seis cenários aprovados. O executor contabiliza sete testes porque inclui o teste principal que agrupa os seis cenários. Nenhuma falha ou teste ignorado.

Limites: não foram realizados testes de carga, alta disponibilidade, timeout ou recuperação automática. Não há rollback, persistência financeira ou vídeo de demonstração produzido por essa suíte. O roteiro de gravação descreve a coleta manual das evidências visuais.
