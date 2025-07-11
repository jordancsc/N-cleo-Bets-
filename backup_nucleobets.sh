#!/bin/bash

# Script de Backup do Núcleo Bets
# Este script cria um backup completo do sistema

echo "🐺 BACKUP NÚCLEO BETS - INICIANDO..."

# Criar diretório de backup
BACKUP_DIR="nucleobets_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 Criando backup em: $BACKUP_DIR"

# Copiar arquivos do backend
echo "🔧 Copiando backend..."
cp -r /app/backend "$BACKUP_DIR/"

# Copiar arquivos do frontend
echo "🎨 Copiando frontend..."
cp -r /app/frontend "$BACKUP_DIR/"

# Criar arquivo de informações do sistema
echo "📋 Criando arquivo de informações..."
cat > "$BACKUP_DIR/INFO.txt" << EOF
🐺 NÚCLEO BETS - SISTEMA DE ANÁLISES DE APOSTAS
===============================================

📅 Data do Backup: $(date)
📍 Versão: 1.0
👤 Admin: Ademir / admin123

🔧 TECNOLOGIAS:
- Backend: FastAPI (Python)
- Frontend: React + Tailwind CSS
- Database: MongoDB
- Autenticação: JWT

🎯 FUNCIONALIDADES:
✅ Sistema de login com admin
✅ Gerenciamento de usuários (expiração automática em 31 dias)
✅ Análises de apostas com opções: Casa, Empate, Fora, Over/Under, Dupla Chance
✅ Filtros por data: Ontem, Hoje, Amanhã
✅ Marcação Green/Red para resultados
✅ Design azul escuro + roxo neon + fundo lobo
✅ Interface responsiva

🚀 COMO RESTAURAR:
1. Copie os arquivos para /app/
2. Execute: yarn install (no frontend)
3. Execute: pip install -r requirements.txt (no backend)
4. Configure as variáveis de ambiente
5. Execute: supervisorctl restart all

🌐 DEPLOY:
- Use o botão "Deploy" no Emergent
- Conecte com GitHub primeiro
- Custa 50 créditos/mês

EOF

# Criar arquivo de comandos úteis
echo "⚙️ Criando arquivo de comandos..."
cat > "$BACKUP_DIR/COMANDOS.txt" << EOF
🔧 COMANDOS ÚTEIS - NÚCLEO BETS
==============================

🏃 INICIAR SISTEMA:
sudo supervisorctl restart all

🔍 VERIFICAR STATUS:
sudo supervisorctl status

📊 VER LOGS:
tail -f /var/log/supervisor/backend.*.log
tail -f /var/log/supervisor/frontend.*.log

🛠️ INSTALAR DEPENDÊNCIAS:
Frontend: cd /app/frontend && yarn install
Backend: cd /app/backend && pip install -r requirements.txt

🔄 REINICIAR SERVIÇOS:
sudo supervisorctl restart frontend
sudo supervisorctl restart backend

🌐 TESTAR API:
curl -X POST "http://localhost:8001/api/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "Ademir", "password": "admin123"}'

📱 PREVIEW:
Use o botão "Preview" na interface do Emergent

🚀 DEPLOY:
1. Clique "Connect GitHub"
2. Clique "Save to GitHub"
3. Clique "Deploy"
4. Clique "Deploy Now"

EOF

# Copiar este próprio script
cp "$0" "$BACKUP_DIR/"

# Criar arquivo ZIP do backup
echo "📦 Criando arquivo ZIP..."
zip -r "${BACKUP_DIR}.zip" "$BACKUP_DIR"

echo "✅ BACKUP COMPLETO!"
echo "📁 Pasta: $BACKUP_DIR"
echo "📦 ZIP: ${BACKUP_DIR}.zip"
echo ""
echo "🎯 PARA RESTAURAR:"
echo "1. Extraia o ZIP"
echo "2. Copie os arquivos para /app/"
echo "3. Execute os comandos do arquivo COMANDOS.txt"
echo ""
echo "🐺 Núcleo Bets - Backup realizado com sucesso!"