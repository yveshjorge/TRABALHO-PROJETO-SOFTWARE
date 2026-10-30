# Diagrama de sequência da implementação

O diagrama representa os arquivos e as rotas desta versão. Vendas não chama Inventário diretamente. Embora os legados usem HTTP 200, a confirmação depende também do campo `status` no corpo JSON.

```mermaid
sequenceDiagram
    actor Cliente
    participant ESB as ESB (esb.js:3000)
    participant Inventario as Inventário (inventario.js:3001)
    participant Vendas as Vendas (vendas.js:3002)
    Cliente->>ESB: POST /api/esb/processar (JSON)
    ESB->>ESB: Validar contrato
    alt Contrato inválido
        ESB-->>Cliente: HTTP 400
    else Contrato válido
        ESB->>Inventario: POST /api/inventario/reserva
        alt Inventário indisponível, timeout ou resposta inesperada
            ESB-->>Cliente: HTTP 502 ou 504 (etapa INVENTARIO)
        else Inventário retorna status ERRO
            Inventario-->>ESB: HTTP 200 (estoque insuficiente)
            ESB-->>Cliente: HTTP 409
        else Inventário retorna status SUCESSO
            Inventario->>Inventario: Reduzir estoque em memória
            Inventario-->>ESB: HTTP 200 (stockAtual)
            ESB->>Vendas: POST /api/vendas/registrar
            alt Venda confirmada
                Vendas-->>ESB: HTTP 200 (status SUCESSO, id, valor)
                ESB-->>Cliente: HTTP 201 (inventario e venda)
            else Vendas indisponível, timeout ou resposta sem sucesso
                ESB-->>Cliente: HTTP 502 ou 504 (reservaConfirmada true)
                Note over ESB,Inventario: Não existe rollback automático
            end
        end
    end
```

Em uma falha de comunicação, a ausência de confirmação não prova ausência de efeito remoto. O booleano `reservaConfirmada` registra a confirmação recebida pelo ESB, não uma garantia de que nenhuma alteração ocorreu quando ele é falso.
