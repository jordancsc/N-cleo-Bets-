# ⚠️ INSTRUÇÕES PARA FAZER DEPLOY GRATUITO

## 🎯 **OPÇÃO GRATUITA - CUSTO R$ 0,00/MÊS**

### 1️⃣ **MONGODB ATLAS (Banco de Dados - GRATUITO)**

**Passo a passo:**
1. Acesse: https://www.mongodb.com/cloud/atlas
2. Clique "Try Free" e faça cadastro
3. Criar cluster:
   - Escolha **M0 Sandbox** (GRATUITO - 512MB)
   - Região: AWS / us-east-1
   - Nome: `nucleo-bets-cluster`
4. Configurar usuário:
   - Database Access → Add New User
   - Username: `admin`
   - Password: `suaSenhaSegura123`
5. Configurar rede:
   - Network Access → Add IP Address
   - Access List Entry: `0.0.0.0/0` (permitir de qualquer lugar)
6. Obter connection string:
   - Connect → Drivers → Node.js
   - Copiar a URL (será algo como):
   ```
   mongodb+srv://admin:suaSenhaSegura123@nucleo-bets-cluster.xxxxx.mongodb.net/nucleobets
   ```

### 2️⃣ **RAILWAY (Backend FastAPI - GRATUITO)**

**Passo a passo:**
1. Acesse: https://railway.app
2. Login com GitHub
3. New Project → Empty Project
4. Add Service → GitHub Repository
5. Conectar sua conta GitHub
6. Fazer upload dos arquivos backend:
   ```
   backend/
   ├── server.py
   ├── requirements.txt
   └── .env
   ```
7. Railway vai detectar Python automaticamente
8. Configurar variáveis de ambiente:
   - Settings → Environment
   - Adicionar:
     ```
     MONGO_URL=mongodb+srv://admin:suaSenhaSegura123@nucleo-bets-cluster.xxxxx.mongodb.net/nucleobets
     DB_NAME=nucleobets
     ```
9. Deploy automático em ~2 minutos
10. Copiar a URL do deploy (exemplo: `https://nucleobets-production.up.railway.app`)

### 3️⃣ **VERCEL (Frontend React - GRATUITO)**

**Passo a passo:**
1. Acesse: https://vercel.com
2. Login com GitHub
3. Import Project
4. Fazer upload dos arquivos frontend:
   ```
   frontend/
   ├── src/
   ├── package.json
   ├── tailwind.config.js
   ├── postcss.config.js
   └── craco.config.js
   ```
5. Antes do deploy, criar arquivo `.env.production`:
   ```
   REACT_APP_BACKEND_URL=https://nucleobets-production.up.railway.app
   ```
6. Vercel detecta React automaticamente
7. Deploy em ~1 minuto
8. Site estará disponível em URL como: `https://nucleo-bets.vercel.app`

### 4️⃣ **AJUSTES FINAIS**

**Atualizar CORS no backend:**
```python
# No arquivo server.py, linha com allow_origins, trocar por:
allow_origins=["https://nucleo-bets.vercel.app", "http://localhost:3000"]
```

**Fazer redeploy no Railway** para aplicar a mudança do CORS.

---

## ✅ **RESULTADO FINAL**

Após seguir todos os passos:
- ✅ **Site funcionando:** https://nucleo-bets.vercel.app
- ✅ **API funcionando:** https://nucleobets-production.up.railway.app
- ✅ **Banco funcionando:** MongoDB Atlas
- ✅ **Custo total:** R$ 0,00/mês
- ✅ **Uptime:** 24/7 permanente

## 📋 **CHECKLIST DE DEPLOY**

- [ ] MongoDB Atlas configurado
- [ ] Railway backend deployado
- [ ] Vercel frontend deployado
- [ ] Variáveis de ambiente configuradas
- [ ] CORS atualizado
- [ ] Site acessível e funcionando
- [ ] Login admin funciona (admin/admin123)
- [ ] Criação de análises funciona
- [ ] Sistema Green/Red funciona

## 🆘 **SE DER ALGUM PROBLEMA**

**Logs do Railway:**
- Dashboard → seu projeto → Deploy Logs

**Logs do Vercel:**
- Dashboard → seu projeto → Functions → View Details

**Problemas comuns:**
- CORS: Atualizar allow_origins no backend
- MongoDB: Verificar string de conexão
- Frontend: Verificar REACT_APP_BACKEND_URL

---

**🎉 PRONTO! SEU NÚCLEO BETS ESTARÁ PERMANENTE E GRATUITO!**