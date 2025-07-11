# ⚠️ TROUBLESHOOTING - SOLUÇÕES PARA PROBLEMAS

## 🚨 **PROBLEMAS MAIS COMUNS + SOLUÇÕES**

---

### 🔴 **PROBLEMA 1: MongoDB Atlas**

#### **❌ "Cluster criação falhou"**
**Solução:**
- Aguarde 10 minutos e tente novamente
- Verifique se escolheu M0 FREE (não M2 ou M5)
- Tente região diferente (us-west-2)

#### **❌ "Connection string não funciona"**
**Solução:**
- Verifique se copiou a string completa
- Troque `<password>` pela sua senha real
- Adicione `/nucleobets` no final da URL
- Exemplo correto:
  ```
  mongodb+srv://admin:nucleobets123@cluster0.xxxxx.mongodb.net/nucleobets
  ```

#### **❌ "Network timeout"**
**Solução:**
- Ir em Network Access
- Deletar IP atual
- Add IP Address → 0.0.0.0/0
- Description: Allow All

---

### 🔴 **PROBLEMA 2: Railway (Backend)**

#### **❌ "Deploy failed - requirements.txt error"**
**Solução:**
- Verificar se requirements.txt está na raiz da pasta
- Abrir requirements.txt e verificar se tem essas linhas:
  ```
  fastapi==0.110.1
  uvicorn==0.25.0
  motor==3.3.1
  python-jose==3.3.0
  bcrypt==4.1.1
  pydantic>=2.6.4
  python-multipart>=0.0.9
  ```

#### **❌ "Application failed to start"**
**Solução:**
- Adicionar variável de ambiente:
  - `PORT` = `8000`
- Verificar se server.py tem no final:
  ```python
  if __name__ == "__main__":
      import uvicorn
      uvicorn.run(app, host="0.0.0.0", port=8000)
  ```

#### **❌ "MongoDB connection error"**
**Solução:**
- Verificar variáveis de ambiente no Railway:
  - `MONGO_URL` deve estar completa
  - `DB_NAME` deve ser `nucleobets`
- Testar conexão MongoDB no Atlas

---

### 🔴 **PROBLEMA 3: Vercel (Frontend)**

#### **❌ "Build failed - missing dependencies"**
**Solução:**
- Verificar se package.json está correto
- Adicionar dependências que estão faltando:
  ```json
  {
    "dependencies": {
      "react": "^19.0.0",
      "react-dom": "^19.0.0",
      "axios": "^1.8.4",
      "react-scripts": "5.0.1"
    },
    "devDependencies": {
      "@craco/craco": "^7.1.0",
      "tailwindcss": "^3.4.17",
      "autoprefixer": "^10.4.20",
      "postcss": "^8.4.49"
    }
  }
  ```

#### **❌ "Page not loading / blank screen"**
**Solução:**
- Verificar se App.js está na pasta src/
- Verificar se index.js existe em src/
- Verificar console do navegador (F12)

#### **❌ "API calls failing"**
**Solução:**
- Verificar se .env tem:
  ```
  REACT_APP_BACKEND_URL=https://seu-backend.railway.app
  ```
- Sem `/api` no final da URL
- Fazer redeploy após mudança

---

### 🔴 **PROBLEMA 4: CORS (Conexão Frontend-Backend)**

#### **❌ "Access to fetch blocked by CORS policy"**
**Solução:**
- No Railway, editar server.py
- Encontrar linha `allow_origins=`
- Trocar para:
  ```python
  allow_origins=[
      "https://seu-site.vercel.app",
      "http://localhost:3000",
      "*"
  ]
  ```
- Salvar → Deploy automático

---

### 🔴 **PROBLEMA 5: Login não funciona**

#### **❌ "Invalid credentials"**
**Solução:**
- Usar credenciais corretas:
  - Usuário: `admin`
  - Senha: `admin123`
- Verificar se backend está rodando
- Abrir Network tab (F12) e ver se API responde

#### **❌ "User not found"**
**Solução:**
- Backend não criou usuário admin
- Verificar logs do Railway
- Aguardar 2-3 minutos após deploy
- Tentar login novamente

---

## 🛠️ **FERRAMENTAS DE DEBUG**

### **🔍 Como verificar se está funcionando:**

#### **MongoDB Atlas:**
```
✅ Cluster status: Active
✅ Network Access: 0.0.0.0/0 
✅ Database User: admin criado
✅ Connection: Test successful
```

#### **Railway Backend:**
```
✅ Deploy status: Success
✅ Logs: No errors
✅ Environment vars: Configuradas
✅ URL: Acessível (retorna JSON)
```

#### **Vercel Frontend:**
```
✅ Build status: Ready
✅ Deploy: Successful  
✅ Site: Carregando página
✅ Console: Sem erros
```

---

## 🚨 **COMANDOS DE EMERGÊNCIA**

### **🔄 Resetar tudo:**

1. **MongoDB:** Deletar cluster → Criar novamente
2. **Railway:** Settings → Delete Service → Criar novamente  
3. **Vercel:** Settings → Delete Project → Fazer upload novamente

### **📞 Onde buscar ajuda:**

1. **Logs do Railway:** Dashboard → Deployments → View Logs
2. **Logs do Vercel:** Dashboard → Functions → Real-time Logs
3. **MongoDB Status:** Atlas → Network Access → IP Whitelist
4. **Browser Console:** F12 → Console → Ver erros

---

## ✅ **CHECKLIST DE VERIFICAÇÃO**

### **Antes de desistir, verifique:**

- [ ] MongoDB cluster está Active
- [ ] IP 0.0.0.0/0 está na whitelist
- [ ] String de conexão está correta
- [ ] Variáveis de ambiente no Railway estão certas
- [ ] Backend retorna JSON ao acessar URL
- [ ] Frontend builded sem erros
- [ ] .env do frontend tem URL do backend
- [ ] CORS está configurado no backend
- [ ] Login admin/admin123 funciona

---

**🎯 COM ESSAS SOLUÇÕES, 99% DOS PROBLEMAS SE RESOLVEM! 💪**