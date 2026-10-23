# Conclusão

O desenvolvimento deste projeto possibilitou compreender a Arquitetura Orientada a Serviços como uma estratégia de integração fundamentada na exposição de capacidades por contratos e na separação de responsabilidades. A prova de conceito, composta por Inventário, Vendas e um mediador implementado em Node.js/Express, relacionou esses princípios a um cenário executável de comunicação entre aplicações.

A principal decisão de design consistiu em centralizar a coordenação do processo no mediador e manter as responsabilidades de negócio nos respectivos domínios. Essa organização simplifica o ponto de contato do consumidor e reduz a necessidade de comunicação direta entre os sistemas. Entretanto, estabelece dependência operacional do mediador e exige cuidado para que ele não absorva regras que pertencem aos legados. Centralizar a integração é útil quando preserva o isolamento das responsabilidades.

O projeto demonstrou que distribuir componentes implica considerar latência, indisponibilidade, evolução de contratos e falhas parciais. Os testes confirmaram o fluxo válido, a interrupção diante de estoque insuficiente e a sinalização de falhas de comunicação. Também evidenciaram que uma reserva pode permanecer aplicada quando o registro da venda não é concluído. Baixo acoplamento estrutural, portanto, precisa ser acompanhado de mecanismos de compatibilidade, observabilidade e recuperação.

No escopo acadêmico, a PoC atende ao propósito de materializar a integração mediada. Seus resultados não permitem generalizações sobre desempenho ou disponibilidade em produção. A ausência de persistência e rollback explicita seus limites. Como continuidade, propõem-se a formalização dos contratos, testes de consistência e timeout, coleta de métricas e avaliação de mecanismos de compensação.

Conclui-se que a qualidade de uma decisão arquitetural depende da adequação ao contexto. SOA oferece recursos relevantes para integrar sistemas independentes, mas sua adoção deve responder a necessidades concretas. O aprendizado principal foi reconhecer que cada escolha resolve problemas e introduz outros, cabendo à equipe justificar as compensações e os limites da solução.

# Referências Bibliográficas

Lista em formato ABNT, organizada alfabeticamente. Reúne livros técnicos, artigo científico e textos técnicos dos próprios autores. Os textos de Fowler são complementares e não equivalem a artigos revisados por pares. Os dados bibliográficos e os links foram consultados em 23 de outubro de 2026; isso não equivale à leitura integral das obras.

CHAPPELL, David A. **Enterprise service bus**. Sebastopol: O’Reilly Media, 2004. Disponível em: <https://www.oreilly.com/library/view/enterprise-service-bus/0596006756/>. Acesso em: 23 out. 2026.

ERL, Thomas. **Service-oriented architecture: concepts, technology, and design**. Upper Saddle River: Prentice Hall PTR, 2005. Disponível em: <https://www.informit.com/store/service-oriented-architecture-concepts-technology-and-9780131858589>. Acesso em: 23 out. 2026.

FOWLER, Martin. **Monolith first**. [S. l.], 3 jun. 2015. Disponível em: <https://martinfowler.com/bliki/MonolithFirst.html>. Acesso em: 23 out. 2026.

LEWIS, James; FOWLER, Martin. **Microservices: a definition of this new architectural term**. [S. l.], 25 mar. 2014. Disponível em: <https://martinfowler.com/articles/microservices.html>. Acesso em: 23 out. 2026.

NEWMAN, Sam. **Building microservices: designing fine-grained systems**. 2. ed. Sebastopol: O’Reilly Media, 2021. Disponível em: <https://www.oreilly.com/library/view/building-microservices-2nd/9781492034018/>. Acesso em: 23 out. 2026.

PAPAZOGLOU, Mike P. Service-oriented computing: concepts, characteristics and directions. In: INTERNATIONAL CONFERENCE ON WEB INFORMATION SYSTEMS ENGINEERING, 4., 2003, Roma. **Proceedings [...]**. Los Alamitos: IEEE Computer Society, 2003. p. 3–12. DOI: <https://doi.org/10.1109/WISE.2003.1254461>.

SOMMERVILLE, Ian. **Software engineering**. 10. ed. Boston: Pearson, 2016. Disponível em: <https://www.pearson.com/en-us/subject-catalog/p/software-engineering/P200000003258?view=educator>. Acesso em: 23 out. 2026.

## Documentação de implementação

AXIOS. **Request config**. [S. l.], [s. d.]. Disponível em: <https://axios-http.com/docs/req_config>. Acesso em: 23 out. 2026.

EXPRESS. **API reference**. [S. l.], [s. d.]. Disponível em: <https://expressjs.com/en/api.html>. Acesso em: 23 out. 2026.
