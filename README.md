# Integração de Vendas e Inventário com SOA

Prova de conceito da disciplina de Análise e Projeto de Software da Universidade Católica de Brasília (UCB). Dois serviços simulam sistemas legados, integrados por um mediador em Node.js/Express. O Axios realiza chamadas HTTP sequenciais: primeiro Inventário, depois Vendas.

## Arquitetura e contrato

| Participante | Porta | Interface | Responsabilidade |
| --- | --- | --- | --- |
| Cliente | Servido pelo ESB | `GET /` | Enviar a solicitação JSON |
| ESB | 3000 | `POST /api/esb/processar` | Validar e coordenar o fluxo |
| Inventário | 3001 | `POST /api/inventario/reserva` | Verificar e reduzir estoque |
| Vendas | 3002 | `POST /api/vendas/registrar` | Simular registro financeiro |

```json
{
  "produtoId": "PROD-001",
  "quantidade": 2,
  "clienteId": "987",
  "valorTotal": 150
}
```

Os identificadores devem ser textos não vazios, a quantidade deve ser um inteiro positivo e o valor deve ser numérico positivo. O Inventário recebe produto e quantidade; Vendas recebe os quatro campos, mas sua implementação atual não utiliza `clienteId`.

## Executar

Pré-requisito: Node.js 18 ou superior com npm. Utilize uma versão LTS ainda suportada. Execute na pasta do projeto:

```powershell
git clone https://github.com/yveshjorge/TRABALHO-PROJETO-SOFTWARE.git
cd TRABALHO-PROJETO-SOFTWARE
npm ci
```

Em três terminais separados, nessa mesma pasta:

```powershell
npm run start:inventario
```

```powershell
npm run start:vendas
```

```powershell
npm start
```

Abra <http://localhost:3000>. O endpoint `GET /health` informa apenas a disponibilidade do ESB, sem testar os legados.

Alternativa pelo PowerShell:

```powershell
$contrato = @{ produtoId = 'PROD-001'; quantidade = 2; clienteId = '987'; valorTotal = 150 } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/esb/processar' -Method Post -ContentType 'application/json' -Body $contrato
```

## Respostas e limitações

| HTTP | Significado |
| --- | --- |
| 201 | Reserva e venda confirmadas |
| 400 | Contrato ou JSON inválido |
| 409 | Inventário recusou a reserva |
| 502 | Falha de comunicação ou resposta inesperada de um legado |
| 504 | Timeout na comunicação com um legado |

O ESB verifica `status` no JSON dos legados: o Inventário retorna HTTP 200 mesmo para estoque insuficiente. Cada chamada tem timeout de cinco segundos. Não há retentativas automáticas nem rollback. Se Vendas falhar depois da reserva, o estoque permanece reduzido. Uma falha de comunicação pode deixar o resultado remoto indeterminado; confira os efeitos antes de reenviar.

O estoque é mantido em memória (`PROD-001`: 50; `PROD-002`: 5) e volta ao valor inicial quando o Inventário reinicia. Vendas apenas simula o registro e não persiste transações. CORS permissivo atende ao cliente local desta PoC; não representa configuração de produção.

## Testes

Pare os servidores manuais antes de executar:

```powershell
npm test
```

A suíte inicia processos próprios nas portas 3000, 3001 e 3002 e os encerra ao terminar. Se alguma porta estiver ocupada, cancela o teste sem encerrar o processo existente. Cobre operação válida, rejeição por estoque, contrato inválido, JSON malformado e indisponibilidade dos legados. Os registros do ESB permitem verificar a ordem das chamadas e a interrupção antes de Vendas.

Esses testes não medem carga, escalabilidade, alta disponibilidade ou recuperação automática. A suíte não simula timeout.

## Materiais acadêmicos

### Semana 3 — Integração, Testes e Corpo do Relatório

- [Metodologia e Desenvolvimento](docs/semana3/metodologia-desenvolvimento.md)
- [Guião de gravação da PoC](docs/semana3/roteiro-gravacao.md)
- [Esboço inicial dos slides](docs/semana3/slides-iniciais.md)
- [Diagrama de sequência](docs/diagramas/sequencia.md)
- [Registro dos testes de integração](docs/semana3/validacao-integracao.md)

### Semana 4 — Revisão, Conclusão e Ensaios

- [Discussão dos Resultados](docs/semana4/discussao-resultados.md)
- [Conclusão e Referências](docs/semana4/conclusao-referencias.md)
- [Roteiro final de slides e ensaio](docs/semana4/slides-ensaio.md)

Os textos são materiais para compor o relatório e a apresentação. Introdução, Fundamentação Teórica e os diagramas anteriores da equipe não foram fornecidos nesta pasta e não são apresentados como entregáveis já revisados.
