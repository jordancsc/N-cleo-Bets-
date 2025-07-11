# 🚀 DEPLOY PASSO A PASSO - SUPER SIMPLES

## 📋 **ANTES DE COMEÇAR**

✅ **Você vai precisar:**
- Email para criar contas
- Computador com internet
- 1 hora de tempo
- Os arquivos do Núcleo Bets (que eu te dei)

---

## 🎯 **ETAPA 1: MONGODB ATLAS (15 minutos)**

### **📺 1.1 - Assistir vídeo primeiro:**
Busque no YouTube: **"MongoDB Atlas tutorial 2024"**

### **⚡ 1.2 - Fazer na prática:**

1. **Ir para:** https://www.mongodb.com/cloud/atlas
2. **Clicar:** "Try Free" 
3. **Cadastrar** com seu email
4. **Confirmar** email
5. **Fazer login**

6. **Criar projeto:**
   - Nome: `Nucleo Bets`
   - Next → Next → Create Project

7. **Criar cluster GRATUITO:**
   - Build a Database
   - **M0 FREE** (importante!)
   - AWS → us-east-1
   - Cluster Name: `nucleo-cluster`
   - Create

8. **Aguardar 3-5 minutos** (vai aparecer uma barra de progresso)

9. **Configurar usuário:**
   - Username: `admin`
   - Password: `nucleobets123` (anote essa senha!)
   - Create User

10. **Configurar rede:**
    - My Local Environment
    - IP Address: `0.0.0.0/0`
    - Description: `Anywhere`
    - Add Entry

11. **Conectar:**
    - Close → Connect
    - Drivers → Node.js
    - **COPIAR** a string inteira (algo como):
    ```
    mongodb+srv://admin:nucleobets123@nucleo-cluster.xxxxx.mongodb.net/
    ```
    
12. **📝 ANOTAR** essa string num bloco de notas!

---

## 🎯 **ETAPA 2: RAILWAY - BACKEND (20 minutos)**

### **📺 2.1 - Assistir vídeo primeiro:**
Busque no YouTube: **"Railway app deploy Python tutorial"**

### **⚡ 2.2 - Fazer na prática:**

1. **Ir para:** https://railway.app
2. **Login with GitHub** (se não tem GitHub, criar rapidinho)
3. **New Project**
4. **Deploy from GitHub repo** 

5. **Preparar arquivos backend:**
   - Criar pasta `backend` no seu computador
   - Colocar dentro os arquivos:
     - server.py
     - requirements.txt
   - Criar arquivo `.env` com:
   ```
   MONGO_URL=mongodb+srv://admin:nucleobets123@nucleo-cluster.xxxxx.mongodb.net/nucleobets
   DB_NAME=nucleobets
   ```

6. **Fazer upload:**
   - Deploy from GitHub → Upload folder
   - Selecionar pasta `backend`
   - Deploy now

7. **Aguardar deploy** (2-3 minutos)

8. **Configurar variáveis:**
   - Settings → Environment
   - Add Variable:
     - Name: `MONGO_URL`
     - Value: `mongodb+srv://admin:nucleobets123@nucleo-cluster.xxxxx.mongodb.net/nucleobets`
   - Add Variable:
     - Name: `DB_NAME` 
     - Value: `nucleobets`

9. **Deploy automático** acontece

10. **COPIAR URL** do projeto (algo como):
    ```
    https://nucleobets-production.up.railway.app
    ```

11. **📝 ANOTAR** essa URL!

---

## 🎯 **ETAPA 3: VERCEL - FRONTEND (15 minutos)**

### **📺 3.1 - Assistir vídeo primeiro:**
Busque no YouTube: **"Vercel deploy React tutorial 2024"**

### **⚡ 3.2 - Fazer na prática:**

1. **Ir para:** https://vercel.com
2. **Continue with GitHub**
3. **New Project**

4. **Preparar arquivos frontend:**
   - Criar pasta `frontend` no seu computador
   - Colocar dentro:
     - pasta `src/` com App.js, App.css, index.js, index.css
     - package.json
     - tailwind.config.js
     - postcss.config.js
     - craco.config.js
   - Criar arquivo `.env` com:
   ```
   REACT_APP_BACKEND_URL=https://nucleobets-production.up.railway.app
   ```

5. **Fazer upload:**
   - Import Git Repository → Upload
   - Selecionar pasta `frontend`
   - Deploy

6. **Aguardar deploy** (2-3 minutos)

7. **COPIAR URL** do site (algo como):
   ```
   https://nucleo-bets.vercel.app
   ```

8. **📝 ANOTAR** essa URL!

---

## 🎯 **ETAPA 4: CONFIGURAÇÃO FINAL (5 minutos)**

### **⚡ 4.1 - Atualizar CORS:**

1. **Voltar no Railway**
2. **Abrir o arquivo server.py**
3. **Procurar linha** `allow_origins=["*"]`
4. **Trocar por:**
   ```python
   allow_origins=["https://nucleo-bets.vercel.app", "http://localhost:3000"]
   ```
5. **Salvar** → Deploy automático

### **⚡ 4.2 - TESTAR TUDO:**

1. **Abrir:** https://nucleo-bets.vercel.app
2. **Fazer login:**
   - Usuário: `admin`
   - Senha: `admin123`
3. **Testar** criar uma análise
4. **Verificar** se aparece na lista

---

## ✅ **RESULTADO FINAL**

Se deu tudo certo, você tem:
- ✅ **Site funcionando:** https://nucleo-bets.vercel.app
- ✅ **Backend funcionando:** https://nucleobets-production.up.railway.app
- ✅ **Banco funcionando:** MongoDB Atlas
- ✅ **Custo:** R$ 0,00/mês
- ✅ **Permanente:** 24/7 no ar

---

## 🆘 **SE DER PROBLEMA**

### **📞 Problemas comuns:**

**❌ Site não carrega:**
- Verificar se Vercel terminou o deploy
- Verificar URL do backend no .env

**❌ Login não funciona:**
- Verificar se Railway terminou o deploy
- Verificar variáveis de ambiente no Railway

**❌ Erro de conexão:**
- Verificar string do MongoDB
- Verificar se IP 0.0.0.0/0 foi adicionado no Atlas

### **🔍 Onde ver erros:**
- **Railway:** Dashboard → Deploy Logs
- **Vercel:** Dashboard → Functions → View Details
- **MongoDB:** Atlas → Network Access

---

**🎉 PRONTO! SEU NÚCLEO BETS ESTARÁ NO AR! 🚀**