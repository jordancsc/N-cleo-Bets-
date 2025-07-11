# 🚀 GUIA DE DEPLOY GRATUITO - NÚCLEO BETS

## 📋 **ESTRUTURA DO PROJETO COMPLETA**

### 📁 **Arquivos Backend (FastAPI + Python)**
```
backend/
├── server.py          # API completa com todas as funcionalidades
├── requirements.txt   # Dependências Python
└── .env              # Variáveis de ambiente (MongoDB)
```

### 📁 **Arquivos Frontend (React + TailwindCSS)**
```
frontend/
├── src/
│   ├── App.js        # Aplicação React principal
│   ├── App.css       # Estilos customizados + Tailwind
│   ├── index.js      # Entry point
│   └── index.css     # Estilos base Tailwind
├── package.json      # Dependências Node.js
├── tailwind.config.js # Configuração Tailwind
├── postcss.config.js  # PostCSS
├── craco.config.js    # CRACO config
└── .env              # URL do backend
```

## 🎯 **CREDENCIAIS ADMIN**
- **Usuário:** admin
- **Senha:** admin123

## 🛠️ **FUNCIONALIDADES COMPLETAS**

### ✅ **Sistema de Autenticação**
- JWT tokens
- Registro de usuários
- Aprovação por admin
- Expiração automática (31 dias)

### ✅ **Sistema de Análises**
- 7 tipos de apostas (Casa, Empate, Fora, Over, Under, Dupla Chance 1 & 2)
- Sistema Green ✅ / Red 🔴
- Estatísticas de precisão
- CRUD completo para admin

### ✅ **Painel Admin**
- Controle total de usuários
- Criar/editar/deletar análises
- Adicionar usuários manualmente
- Aprovação/desativação
- Limpeza automática de usuários expirados

### ✅ **Visual Profissional**
- Design azul escuro + roxo neon
- Fundo gradiente personalizado
- Glassmorphism
- Responsivo mobile

---

## 🔥 **DEPLOY GRATUITO - PASSO A PASSO**

### 🏗️ **ETAPA 1: MONGODB ATLAS (Banco de Dados)**

1. **Criar conta grátis:**
   - Acesse: https://www.mongodb.com/cloud/atlas
   - Clique em "Try Free"
   - Faça cadastro

2. **Criar cluster:**
   - Escolha "M0 Sandbox" (GRATUITO)
   - Região: AWS / us-east-1
   - Nome: nucleo-bets-cluster

3. **Configurar acesso:**
   - Database Access: Criar usuário/senha
   - Network Access: Adicionar IP 0.0.0.0/0 (qualquer IP)

4. **Obter string de conexão:**
   - Connect → Drivers → Node.js
   - Copiar connection string
   - Exemplo: `mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/nucleobets`

### 🚀 **ETAPA 2: RAILWAY (Backend - FastAPI)**

1. **Criar conta:**
   - Acesse: https://railway.app
   - Login com GitHub

2. **Fazer upload do backend:**
   - New Project → Deploy from GitHub repo
   - Ou: Upload folder com arquivos backend/

3. **Configurar variáveis:**
   ```
   MONGO_URL=mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/nucleobets
   DB_NAME=nucleobets
   ```

4. **Railway vai detectar Python e fazer deploy automático**

### 🌐 **ETAPA 3: VERCEL (Frontend - React)**

1. **Preparar frontend:**
   - Criar arquivo `.env.production`:
   ```
   REACT_APP_BACKEND_URL=https://seu-backend.railway.app
   ```

2. **Deploy no Vercel:**
   - Acesse: https://vercel.com
   - Login com GitHub
   - Import Project → Upload folder frontend/
   - Vercel detecta React automaticamente

3. **Configurar variável de ambiente:**
   - Settings → Environment Variables
   - Adicionar: `REACT_APP_BACKEND_URL` = URL do Railway

### 🔗 **ETAPA 4: CONFIGURAÇÕES FINAIS**

1. **Atualizar CORS no backend:**
   ```python
   # Em server.py, atualizar origins:
   allow_origins=["https://seu-frontend.vercel.app"]
   ```

2. **Testar conexões:**
   - Frontend conecta com backend ✅
   - Backend conecta com MongoDB ✅
   - Sistema de login funcionando ✅

### 🎊 **RESULTADO FINAL**
- **Frontend:** https://nucleo-bets.vercel.app
- **Backend:** https://nucleo-bets.railway.app  
- **Banco:** MongoDB Atlas (gratuito)
- **Custo total:** R$ 0,00/mês
- **Uptime:** 24/7 permanente

---

## 📦 **ARQUIVOS PRONTOS PARA DEPLOY**

Todos os arquivos estão prontos e testados:
- ✅ Backend completo
- ✅ Frontend responsivo  
- ✅ Banco de dados configurado
- ✅ Autenticação JWT
- ✅ Sistema de expiração
- ✅ Design profissional

## 🔄 **PRÓXIMOS PASSOS RECOMENDADOS**

1. **Deploy imediato** nos serviços gratuitos
2. **Teste completo** de todas as funcionalidades
3. **Backup automático** do MongoDB Atlas
4. **Monitoramento** com Railway/Vercel dashboards

---

## 🆘 **SUPORTE**

Se precisar de ajuda com o deploy:
1. Verificar logs do Railway/Vercel
2. Conferir variáveis de ambiente
3. Testar conexão com MongoDB
4. Validar URLs entre frontend/backend

**NÚCLEO BETS ESTÁ PRONTO PARA SER PERMANENTE! 🚀**