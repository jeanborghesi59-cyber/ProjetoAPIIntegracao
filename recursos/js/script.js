// recursos/js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const resultadoDiv = document.getElementById('resultado');
    const botoes = document.querySelectorAll('.ativo-btn');
    const apiBaseUrl = 'http://127.0.0.1:8000/cotacao/'; // Endpoint financeiro

    botoes.forEach(button => {
        button.addEventListener('click', async () => {
            const ativo = button.getAttribute('data-ativo');
            const url = apiBaseUrl + ativo;
            
            resultadoDiv.innerHTML = `<span class="loading-message">Buscando dados de: ${ativo.toUpperCase()}...</span>`;
            resultadoDiv.className = ''; 

            try {
                const response = await fetch(url);
                const dados = await response.json();

                if (response.ok) {
                    // SUCESSO: Renderiza os dados financeiros
                    resultadoDiv.className = 'card-resultado';
                    
                    const valorFormatadoUSD = new Intl.NumberFormat('pt-BR', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                    }).format(dados.valor_dolar_normalizado);

                    const volumeFormatado = new Intl.NumberFormat('pt-BR').format(dados.volume_negociacao);

                    resultadoDiv.innerHTML = `
                        <h4>📊 Dados de ${dados.ativo_id}</h4>
                        <p><strong>Valor (USD):</strong> $${valorFormatadoUSD}</p>
                        <p><strong>Volume 24h (Simulado):</strong> ${volumeFormatado}</p>
                        <p><strong>Índice de Liquidez:</strong> ${dados.indice_liquidez}</p>
                    `;
                } else {
                    // ERRO: Mostra a mensagem de erro formatada (404, 500)
                    resultadoDiv.className = 'erro-resultado';
                    resultadoDiv.innerHTML = `
                        <h4>❌ ERRO ${response.status}: ${dados.detail || 'Ocorreu um erro'}</h4>
                        <p>Detalhes: ${JSON.stringify(dados, null, 2)}</p>
                    `;
                }
            } catch (error) {
                // Erro de Conexão
                resultadoDiv.className = 'erro-resultado';
                resultadoDiv.innerHTML = `
                    <h4>🚨 ERRO DE CONEXÃO</h4>
                    <p>Certifique-se de que o Uvicorn está rodando em <code>http://127.0.0.1:8000</code>.</p>
                    <p>Detalhes: ${error.message}</p>
                `;
            }
        });
    });
});