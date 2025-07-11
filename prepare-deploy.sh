#!/bin/bash

# Script para preparar os arquivos para deploy no Railway
# Execute este comando no terminal para criar um arquivo ZIP:

echo "🚀 Preparando arquivos para deploy no Railway..."

# Criar diretório temporário
mkdir -p /tmp/nucleo-bets-backend

# Copiar arquivos essenciais
cp /app/DEPLOY/backend/server.py /tmp/nucleo-bets-backend/
cp /app/DEPLOY/backend/requirements.txt /tmp/nucleo-bets-backend/
cp /app/DEPLOY/backend/Procfile /tmp/nucleo-bets-backend/
cp /app/DEPLOY/backend/runtime.txt /tmp/nucleo-bets-backend/

# Criar arquivo .env
echo "MONGO_URL=mongodb+srv://jordaniomouramatos:nucleobets123@nucleobets.twxqbxm.mongodb.net/?retryWrites=true&w=majority&appName=nucleobets" > /tmp/nucleo-bets-backend/.env
echo "DB_NAME=nucleobets" >> /tmp/nucleo-bets-backend/.env

# Criar README
echo "# Núcleo Bets Backend
Deploy no Railway:
1. Configure as variáveis de ambiente no Railway
2. MONGO_URL e DB_NAME
3. O Railway detectará Python automaticamente" > /tmp/nucleo-bets-backend/README.md

# Criar ZIP
cd /tmp && zip -r nucleo-bets-backend.zip nucleo-bets-backend/

echo "✅ Arquivo ZIP criado em: /tmp/nucleo-bets-backend.zip"
echo "📁 Conteúdo preparado em: /tmp/nucleo-bets-backend/"

ls -la /tmp/nucleo-bets-backend/