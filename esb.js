const express = require('express');
const cors = require('cors'); // <--- Linha nova
const app = express();

app.use(cors()); // <--- Linha nova
app.use(express.json());

// Definição do Contrato Formal do Barramento
app.post('/api/esb/processar', (req, res) => {
    const payload = req.body;
    console.log('[Barramento ESB] Requisição unificada recebida:', payload);
    console.log('[Barramento ESB] A preparar orquestração para os sistemas legados...');
    
    // A integração síncrona com os sistemas da porta 3001 e 3002 será implementada na Semana 3
    
    res.json({ 
        status: 'CONFIGURADO', 
        mensagem: 'Barramento (Mediador) está online e a aceitar o contrato.' 
    });
});

app.listen(3000, () => console.log('[Barramento SOA] ESB ativo na porta 3000'));