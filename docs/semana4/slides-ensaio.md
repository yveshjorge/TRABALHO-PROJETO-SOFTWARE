# Roteiro final de slides e ensaio — Semana 4

Responsáveis pela finalização dos slides: membros 4 e 6. A discussão e o ensaio envolvem toda a equipe; conclusão e referências ficam a cargo dos membros 5 e 6. Este arquivo é um roteiro para montagem da apresentação, não um arquivo PowerPoint.

## Slide 1 — Integração de Vendas e Inventário com SOA

- Projeto de Análise e Projeto de Software — UCB.
- Objetivo: integrar sistemas independentes por serviços.
- Questão: como coordenar o processo preservando responsabilidades de domínio?

## Slide 2 — Problema e requisitos

- Inventário controla disponibilidade e redução de estoque.
- Vendas simula o registro financeiro.
- Prioridades: contrato padronizado, separação de responsabilidades e menor dependência direta.
- Os serviços simulam legados; não houve migração de sistemas empresariais reais.

## Slide 3 — Por que SOA?

- O cenário exige integrar aplicações independentes.
- Serviços expõem capacidades sem revelar detalhes internos.
- A coordenação fica no mediador.
- A escolha atende ao cenário didático; não representa uma solução universal.

## Slide 4 — Estrutura da arquitetura

- `index.html`: envia o contrato JSON ao ESB.
- `esb.js`, porta 3000: valida e coordena.
- `inventario.js`, porta 3001: verifica e reduz estoque.
- `vendas.js`, porta 3002: simula o registro financeiro.
- Mostrar apenas os componentes existentes no código.

Fala: “O tema defendido é a integração SOA por um mediador. Processos separados, por si só, não comprovam todas as propriedades de microsserviços autônomos.”

## Slide 5 — Sequência e contratos

- Mostrar o [diagrama da implementação](../diagramas/sequencia.md).
- Exibir o JSON aceito e os dados encaminhados a cada legado.
- Explicar por que Vendas só é chamado após a reserva.
- Destacar a interpretação de `status: 'ERRO'` no corpo HTTP 200 do Inventário.

## Slide 6 — Centralização e isolamento

- ESB coordena chamadas e interpreta respostas.
- Inventário mantém regras de estoque.
- Vendas mantém a simulação do registro financeiro.
- Benefício: reduzir o conhecimento direto entre legados.
- Limite: evitar que o mediador concentre regras de todos os domínios.

## Slide 7 — Demonstração e evidências

- Operação válida: estoque 50 → 48 e confirmação de venda.
- Estoque insuficiente: integração interrompida antes de Vendas.
- Contrato inválido: rejeição antes das chamadas remotas.
- Falha de Vendas após a reserva: resultado parcial informado.
- Não confundir testes funcionais com comprovação de desempenho sob carga.

## Slide 8 — Trade-offs

- Menor dependência estrutural × dependência dos contratos.
- Integração mediada × latência e comunicação adicional.
- Coordenação central × risco de gargalo e indisponibilidade.
- Distribuição × falhas parciais e consistência.
- Governança × documentação, versionamento e monitoramento.

## Slide 9 — Quando seria inadequado?

- Aplicação pequena sem necessidade relevante de integração.
- Distribuição sem autonomia útil ou requisitos concretos.
- Monólito modular como alternativa de menor custo operacional.
- Antipadrões: mediador excessivo e monólito distribuído.
- Tamanho reduzido não impede SOA se a integração externa justificar sua adoção.

## Slide 10 — Aprendizados e evolução

- Separar coordenação de integração e responsabilidades de domínio.
- Reconhecer dependências temporais e operacionais.
- Melhorias propostas: contratos formais, compensação, idempotência e observabilidade.
- Limites: dados em memória, ausência de rollback e de medições de carga.

Fala final: “Escolhemos a mediação para integrar os sistemas e reconhecemos os custos e os limites da validação realizada.”

## Slide de apoio — Referências

Selecionar as obras efetivamente citadas na apresentação a partir da [lista bibliográfica](conclusao-referencias.md). Manter os links para consulta.

## Ensaio geral

1. Organizar cada argumento em problema, decisão, evidência e custo.
2. Usar os diagramas como guia; reservar código para comprovar decisões específicas.
3. Cronometrar toda a apresentação conforme o tempo definido pelo professor, incluindo transições e perguntas.
4. Conferir as portas 3000, 3001 e 3002 e o estoque antes da demonstração.
5. Deixar o vídeo da PoC disponível como contingência.
6. Distinguir “implementamos” de “propomos”; evitar alegações sem evidência.

| Pergunta | Resposta a defender |
| --- | --- |
| Por que o ESB? | Centralizar a coordenação e reduzir conhecimento direto entre sistemas. |
| Por que não um monólito? | O exercício trata da integração de aplicações independentes; um monólito modular seria uma alternativa para uma aplicação nova pequena. |
| E se o ESB parar? | A implantação atual tem uma única instância e o fluxo integrado fica indisponível. |
| E se Vendas falhar após a reserva? | O estoque permanece reduzido; o ESB informa a falha parcial. |
| Onde estão as regras? | No domínio responsável; o mediador coordena a integração. |
| O projeto comprovou escalabilidade? | Não foram realizados testes de carga ou disponibilidade que sustentem essa afirmação. |
