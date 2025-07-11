# Núcleo Bets - Backend

Sistema de análises de futebol desenvolvido em FastAPI.

## 🚀 Deploy no Railway

Este repositório está pronto para deploy no Railway.

### ⚙️ Configuração das Variáveis de Ambiente

No Railway, adicione estas variáveis:

```
MONGO_URL=mongodb+srv://jordaniomouramatos:nucleobets123@nucleobets.twxqbxm.mongodb.net/?retryWrites=true&w=majority&appName=nucleobets
DB_NAME=nucleobets
```

### 🔑 Credenciais Admin

- **Usuário:** admin
- **Senha:** admin123

### 📋 Funcionalidades

- ✅ Sistema de autenticação JWT
- ✅ Controle de usuários (admin)
- ✅ Sistema de análises de futebol
- ✅ Palpites valiosos
- ✅ Estatísticas e precisão
- ✅ Expiração automática de usuários (31 dias)

### 🛠️ Tecnologias

- FastAPI
- MongoDB (Atlas)
- JWT Authentication
- BCrypt para senhas
- Motor (MongoDB async driver)

## 🔧 Desenvolvimento Local

1. Instale as dependências:
```bash
pip install -r requirements.txt
```

2. Configure o .env:
```
MONGO_URL=sua_string_mongodb
DB_NAME=nucleobets
```

3. Execute:
```bash
uvicorn server:app --reload
```

## 📊 Endpoints Principais

- `/api/auth/login` - Login de usuários
- `/api/auth/register` - Registro de usuários
- `/api/admin/analysis` - CRUD de análises (admin)
- `/api/admin/valuable-tips` - CRUD de palpites (admin)
- `/api/analysis` - Visualizar análises (usuários)
- `/api/valuable-tips` - Visualizar palpites (usuários)
- `/api/stats` - Estatísticas do sistema