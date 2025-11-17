// recursos/js/script.js

// Espera que o documento HTML esteja completamente carregado antes de executar o código.
document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML
    const resultadoDiv = document.getElementById('resultado'); // Onde o resultado será exibido
    const botoes = document.querySelectorAll('.ativo-btn'); // Todos os botões de ativo
    const apiBaseUrl = 'http://127.0.0.1:8000/cotacao/'; // URL do nosso Middleware FastAPI

    // Adiciona um "ouvinte de evento" (click) a cada botão
    botoes.forEach(button => {
        button.addEventListener('click', async () => {
            const ativo = button.getAttribute('data-ativo'); // Pega o ID do ativo (ex: 'bitcoin')
            const url = apiBaseUrl + ativo; // Monta a URL completa para a API

            // Limpa o resultado anterior e mostra mensagem de carregamento
            resultadoDiv.innerHTML = `<span class="loading-message">Buscando dados de: ${ativo.toUpperCase()}...</span>`;
            resultadoDiv.className = '';

            try {
                // CHAMADA À API: Faz a requisição HTTP para o nosso Middleware (FastAPI)
                const response = await fetch(url);
                const dados = await response.json(); // Converte a resposta JSON em objeto

                // Verifica se a resposta foi bem-sucedida (Status 200 OK)
                if (response.ok) {
                    // SUCESSO: Renderiza os dados financeiros no formato final
                    resultadoDiv.className = 'card-resultado';

                    // FORMATAÇÃO DE USABILIDADE: Garante que os números apareçam no padrão brasileiro (Ponto e Vírgula)
                    const valorFormatadoUSD = new Intl.NumberFormat('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }).format(dados.valor_dolar_normalizado);

                    // Formatação para números inteiros grandes (milhar)
                    const volumeFormatado = new Intl.NumberFormat('pt-BR').format(dados.volume_negociacao);

                    // Insere os dados formatados no HTML
                    resultadoDiv.innerHTML = `
                        <h4>📊 Dados de ${dados.ativo_id}</h4>
                        <p><strong>Valor (USD):</strong> $${valorFormatadoUSD}</p>
                        <p><strong>Volume 24h (Simulado):</strong> ${volumeFormatado}</p>
                        <p><strong>Índice de Liquidez:</strong> ${dados.indice_liquidez}</p>
                    `;
                } else {
                    // ERRO: Se a resposta não for 'ok' (404, 503, 500), mostra o erro retornado pelo FastAPI
                    resultadoDiv.className = 'erro-resultado';
                    resultadoDiv.innerHTML = `
                        <h4>❌ ERRO ${response.status}: ${dados.detail || 'Ocorreu um erro'}</h4>
                        <p>Detalhes: ${JSON.stringify(dados, null, 2)}</p>
                    `;
                }
            } catch (error) {
                // Erro de Conexão: Ocorre se o servidor FastAPI (Uvicorn) não estiver rodando
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