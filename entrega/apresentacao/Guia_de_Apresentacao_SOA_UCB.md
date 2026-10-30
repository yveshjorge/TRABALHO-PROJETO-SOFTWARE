# Guia de apresentação e ensaio — Projeto SOA/UCB

## Objetivo da defesa

A apresentação deve defender as decisões arquiteturais do grupo. O código e a demonstração comprovam a execução da PoC, mas o foco é explicar por que o grupo escolheu SOA, que problema o mediador resolve e quais custos essa escolha introduz.

## Mensagem central

A PoC integra dois sistemas legados — Inventário e Vendas — por meio de um Barramento de Serviços (ESB). O cliente envia uma solicitação JSON ao ESB; o ESB consulta primeiro o Inventário e, somente se houver estoque, solicita o registro da venda. Assim, o cliente não precisa conhecer as interfaces internas de cada sistema legado.

## Roteiro sugerido

1. **Contexto e problema** — Apresentem a necessidade de integrar Vendas e Inventário, destacando que são sistemas distintos e podem evoluir separadamente.
2. **Decisão arquitetural** — Expliquem a escolha por SOA e pelo ESB como mediador. Mostrem o diagrama de componentes e identifiquem os mesmos elementos existentes na PoC.
3. **Fluxo da solicitação** — Percorram o diagrama de sequência: cliente → ESB → Inventário → ESB → Vendas → ESB → cliente. Enfatizem que a venda só é registrada após a confirmação de estoque.
4. **Demonstração da PoC** — Mostrem primeiro o caso de sucesso e depois o caso de estoque insuficiente. Relacionem cada resposta ao passo correspondente no fluxo, sem transformar a apresentação em leitura de código.
5. **Análise crítica** — Discutam os benefícios e os custos: menor acoplamento entre cliente e legados e possibilidade de integração; em contrapartida, chamadas de rede aumentam latência e falhas parciais exigem tratamento. Reconheçam governança de contratos e risco de concentração/disponibilidade do ESB.
6. **Limites e conclusão** — Delimitem que a PoC demonstra um fluxo síncrono simples. Expliquem que SOA não é automaticamente adequado a aplicações pequenas, nas quais o custo operacional e de governança pode superar o benefício.

## Como explicar as decisões de design

- **Por que existe o ESB?** Para receber a solicitação do cliente, coordenar as chamadas e reduzir o conhecimento direto que o cliente precisa ter dos sistemas legados.
- **Por que consultar Inventário antes de Vendas?** Para evitar registrar uma venda quando o estoque não atende à quantidade solicitada.
- **Por que centralizar a mediação?** A centralização simplifica a coordenação deste fluxo e padroniza a entrada. Ela também concentra responsabilidade: indisponibilidade ou sobrecarga do ESB pode interromper a operação.
- **O que permanece isolado?** As responsabilidades de estoque e de vendas continuam em serviços distintos. O ESB coordena o fluxo, mas não deve absorver as regras de domínio desses serviços.
- **Qual é o custo da integração síncrona?** O tempo de resposta depende da rede e das respostas dos dois serviços; uma falha ou demora pode afetar a solicitação completa.
- **Como evitar generalizações?** Chamem a implementação de PoC de integração SOA com ESB. Não afirmem que foi implementado WSDL, SOAP, alta disponibilidade, segurança de produção ou tolerância a falhas se isso não estiver de fato no código.

## Recomendações para o ensaio geral

- Ensaiem com cronômetro e distribuam a fala para que todos contribuam sem repetir a mesma explicação.
- Definam uma pessoa para avançar os slides e outra para conduzir a demonstração; combinem a troca antes de começar.
- Testem os três servidores, as portas 3000, 3001 e 3002 e o navegador antes da apresentação. Confirmem também que as capturas exibidas correspondem ao comportamento atual da PoC.
- Tenham os slides e as capturas de evidência disponíveis localmente. Se a rede ou a execução ao vivo falhar, expliquem o fluxo com o diagrama e apresentem as capturas, deixando claro que são evidências de uma execução anterior.
- Ao mostrar o código, indiquem apenas os pontos que comprovam a decisão: endpoint do ESB, chamada ao Inventário, condição de estoque e chamada a Vendas. Voltem em seguida ao diagrama e à justificativa.
- Usem os diagramas para explicar relações e responsabilidades; evitem ler cada seta ou cada bullet literalmente.
- Preparem respostas curtas para perguntas sobre latência, falha do ESB, governança de contratos, tratamento de erros e adequação da solução a sistemas pequenos.
- Se não souberem algo, delimitem o que a PoC implementa e o que seria uma evolução futura, sem apresentar hipótese como funcionalidade existente.

## Respostas curtas para perguntas prováveis

**O ESB não se torna um ponto único de falha?** Sim, na topologia simples da PoC ele é um componente central. Em produção, seria necessário considerar redundância, balanceamento, monitoramento e estratégias de recuperação.

**Por que não integrar diretamente Vendas e Inventário?** A integração direta pode atender a um cenário pequeno, mas aumenta dependências entre os sistemas. O mediador oferece um ponto de coordenação e reduz conexões diretas; em contrapartida, acrescenta uma dependência central e custo operacional.

**SOA é sempre a melhor escolha?** Não. Para uma aplicação pequena, com poucos componentes e sem necessidade relevante de integração ou evolução independente, a infraestrutura e a governança podem trazer mais custo do que benefício.

**O que a demonstração comprova?** O cenário de sucesso evidencia a reserva de estoque seguida do registro da venda; o cenário de erro mostra que, sem estoque suficiente, o fluxo é interrompido antes do serviço de Vendas.

## Checklist imediatamente antes de apresentar

- [ ] Slides abrem sem depender de internet.
- [ ] Participantes, ordem de fala e tempo foram combinados.
- [ ] Diagrama corresponde aos componentes e ao fluxo implementados.
- [ ] Caso de sucesso e caso de estoque insuficiente estão prontos para demonstrar.
- [ ] Capturas de evidência estão acessíveis como contingência.
- [ ] A equipe consegue citar pelo menos um benefício e dois custos/limitações da arquitetura.
- [ ] A conclusão distingue o que foi demonstrado do que seria necessário para produção.
