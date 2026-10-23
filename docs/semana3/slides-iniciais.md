# Esboço inicial da apresentação — Semana 3

## Slide 1 — Objetivo da integração

- Integrar Inventário e Vendas por serviços HTTP.
- Expor um contrato único ao consumidor.
- Coordenar o processo por meio de um mediador SOA.

## Slide 2 — Participantes e responsabilidades

- Cliente: envia o contrato JSON.
- ESB, porta 3000: valida e coordena.
- Inventário, porta 3001: verifica disponibilidade e reduz estoque.
- Vendas, porta 3002: simula o registro financeiro.

## Slide 3 — Diagrama de Sequência: fluxo principal

- Cliente → ESB: `POST /api/esb/processar`.
- ESB → Inventário: `POST /api/inventario/reserva`.
- Inventário → ESB: confirmação da reserva.
- ESB → Vendas: `POST /api/vendas/registrar`.
- Vendas → ESB: confirmação e identificador.
- ESB → Cliente: HTTP 201 e resultado consolidado.

Exibir o [diagrama](../diagramas/sequencia.md). Fala: “A confirmação do Inventário é condição para iniciar a chamada a Vendas.”

## Slide 4 — Fluxo dos dados

- Entrada: `produtoId`, `quantidade`, `clienteId`, `valorTotal`.
- Inventário recebe produto e quantidade.
- Vendas recebe os quatro campos; o legado atual não utiliza `clienteId`.
- ESB devolve as respostas consolidadas.

## Slide 5 — Caminhos alternativos

- Contrato ou JSON inválido: HTTP 400, sem chamadas remotas.
- Estoque insuficiente: HTTP 409, sem chamada a Vendas.
- Serviço indisponível: HTTP 502.
- Timeout: HTTP 504; tratamento implementado, sem teste automático desse cenário.
- Falha depois da reserva: resultado parcial, sem rollback.

## Slide 6 — Evidências da integração

- Exibir JSON e resposta consolidada.
- Relacionar logs às mensagens do diagrama.
- Mostrar que o navegador chama somente o ESB.
- Demonstrar que a rejeição do Inventário interrompe o fluxo.

## Slide 7 — Justificativas implementadas

- Mediação concentra o conhecimento dos destinos.
- Responsabilidades de estoque e vendas permanecem separadas.
- Chamadas sequenciais explicitam a dependência entre etapas.
- Validação e tratamento de erros tornam o comportamento demonstrável.
- A PoC comprova integração funcional, sem transação distribuída atômica.
