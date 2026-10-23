# TRABALHO-PROJETO-SOFTWARE

# Arquitetura Orientada a Serviços (SOA) - Prova de Conceito (PoC)

Projeto académico desenvolvido para a disciplina de Análise e Projeto de Software da Universidade Católica de Brasília (UCB).

## 📌 Sobre o Projeto
Esta Prova de Conceito (PoC) demonstra a aplicação prática da Arquitetura Orientada a Serviços (SOA). O objetivo é integrar dois sistemas legados independentes (Vendas e Inventário) através de um Barramento de Serviços Corporativos (ESB), que atua como mediador das requisições, garantindo o baixo acoplamento e a separação de preocupações.

## 🏗️ Arquitetura
O ecossistema é composto por três microsserviços desenvolvidos em Node.js (Express) e uma interface de simulação:
* **ESB Mediator (Porta 3000):** Ponto único de entrada que recebe o contrato unificado e orquestra a comunicação.
* **Sistema Legado de Inventário (Porta 3001):** Valida e deduz o stock de forma isolada.
* **Sistema Legado de Vendas (Porta 3002):** Regista a transação financeira de forma isolada.
* **Frontend (index.html):** Interface visual simples para envio do payload (contrato JSON) ao barramento.

## 🚀 Como Executar Localmente

### Pré-requisitos
* [Node.js](https://nodejs.org/) instalado na máquina.

### Instalação
1. Clone o repositório:
   ```bash
   git clone [https://github.com/SEU-USUARIO/nome-do-repositorio.git](https://github.com/SEU-USUARIO/nome-do-repositorio.git)
