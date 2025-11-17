# main.py - Agregação e Normalização de Dados Financeiros

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import requests
import random

app = FastAPI()

# URL BASE da API externa real (CoinGecko para criptomoedas)
COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3/simple/price"

# --- CONFIGURAÇÃO CORS (Crucial para o cliente.html) ---
origins = ["*"] 
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. MODELOS PYDANTIC (Validação e Normalização) ---

# Modelo para validar a resposta da API Externa A (CoinGecko)
class CoinGeckoPrice(BaseModel):
    usd: float = Field(..., description="Preço em dólar, deve ser um float.")

# Modelo para validar a simulação de Volume/Metadata (API Externa B)
class VolumeMetadataExterna(BaseModel):
    volume_24h: int = Field(..., description="Volume de negociação, deve ser um inteiro.")
    liquidez_status: str

# Modelo para a Resposta CONSOLIDADA da SUA API (Output NORMALIZADO)
class AtivoConsolidado(BaseModel):
    ativo_id: str
    valor_dolar_normalizado: float
    volume_negociacao: int
    indice_liquidez: str
    
# --- 2. ENDPOINT PRINCIPAL ---

@app.get("/")
def home():
    return {"Mensagem": "API de Agregação Financeira Ativa."}

@app.get("/cotacao/{ativo_id}", response_model=AtivoConsolidado)
def obter_cotacao_consolidada(ativo_id: str):
    
    # 1. INTEGRAÇÃO 1: COINGECKO (Busca Preço Real)
    try:
        url_coingecko = f"{COINGECKO_BASE_URL}?ids={ativo_id}&vs_currencies=usd"
        response_cg = requests.get(url_coingecko, timeout=5)
        response_cg.raise_for_status()
        dados_cg = response_cg.json()
        
        if not dados_cg or ativo_id not in dados_cg:
             raise HTTPException(status_code=404, detail=f"Ativo '{ativo_id}' não encontrado na API externa.")

        # VALIDAÇÃO PYDANTIC DO PREÇO: Garante que o campo 'usd' é um número float.
        preco_validado = CoinGeckoPrice(**dados_cg[ativo_id])
        
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=503, detail=f"Falha ao conectar com a API de Preços (CoinGecko): {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro de Validação de Preço (Pydantic falhou): {e}")

    # 2. INTEGRAÇÃO 2: SERVIÇO DE VOLUME (Simulado com dados aleatórios)
    volume_simulado = random.randint(1000000, 50000000)
    
    dados_volume = {
        "volume_24h": volume_simulado,
        "liquidez_status": "Alta" if volume_simulado > 10000000 else "Média"
    }

    try:
        # VALIDAÇÃO PYDANTIC DO VOLUME: Garante que o campo 'volume_24h' é um inteiro.
        volume_validado = VolumeMetadataExterna(**dados_volume)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro de Validação de Volume: {e}")
        
    # 3. NORMALIZAÇÃO E AGREGAÇÃO
    
    # O campo 'usd' da API externa é NORMALIZADO para 'valor_dolar_normalizado'
    return AtivoConsolidado(
        ativo_id=ativo_id.upper(),
        valor_dolar_normalizado=preco_validado.usd,
        volume_negociacao=volume_validado.volume_24h,
        indice_liquidez=volume_validado.liquidez_status
    )