# 🚀 ARQUIVOS PARA UPLOAD NO RAILWAY

## 📋 Lista de arquivos que você precisa criar no Railway:

### 1. server.py (arquivo principal)
- Copie todo o conteúdo do arquivo /app/DEPLOY/backend/server.py

### 2. requirements.txt (dependências)
```
fastapi==0.110.1
uvicorn==0.25.0
python-multipart==0.0.9
python-dotenv==1.0.0
motor==3.3.1
pydantic>=2.6.4
python-jose[cryptography]==3.3.0
bcrypt==4.1.1
requests>=2.31.0
pandas>=2.2.0
numpy>=1.26.0
```

### 3. Procfile (configuração do Railway)
```
web: uvicorn server:app --host 0.0.0.0 --port $PORT
```

### 4. runtime.txt (versão do Python)
```
python-3.11
```

### 5. .env (variáveis de ambiente)
```
MONGO_URL=mongodb+srv://jordaniomouramatos:nucleobets123@nucleobets.twxqbxm.mongodb.net/?retryWrites=true&w=majority&appName=nucleobets
DB_NAME=nucleobets
```

## ⚙️ Configuração no Railway:

### Variáveis de Ambiente (Settings → Environment):
- MONGO_URL: mongodb+srv://jordaniomouramatos:nucleobets123@nucleobets.twxqbxm.mongodb.net/?retryWrites=true&w=majority&appName=nucleobets
- DB_NAME: nucleobets

### Deploy automático acontecerá após upload!