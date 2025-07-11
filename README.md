# Núcleo Bets - Sistema de Análises de Futebol

Sistema completo de análises de futebol com controle administrativo e sistema Green/Red.

## 🎯 Funcionalidades

### 👑 **Admin (Você)**
- ✅ Controle total do sistema
- ✅ Criar/editar/deletar análises
- ✅ 7 tipos de apostas (Casa, Empate, Fora, Over, Under, Dupla Chance 1 & 2)
- ✅ Marcar como Green ✅ ou Red 🔴
- ✅ Adicionar/aprovar/deletar usuários
- ✅ Sistema de expiração automática (31 dias)

### 👥 **Usuários**
- ✅ Visualizar análises
- ✅ Ver estatísticas de precisão
- ✅ Conta expira em 31 dias
- ✅ Dependem de aprovação admin

### 📊 **Sistema**
- ✅ Autenticação JWT
- ✅ Banco MongoDB
- ✅ Design profissional azul/roxo neon
- ✅ Responsive mobile
- ✅ Limpeza automática de usuários expirados

## 🔑 Credenciais Admin

- **Usuário:** admin
- **Senha:** admin123

## 🚀 Deploy Gratuito

Consulte `DEPLOY_GUIDE.md` para instruções completas de deploy gratuito usando:
- **MongoDB Atlas** (banco gratuito)
- **Railway** (backend FastAPI)
- **Vercel** (frontend React)

**Custo total: R$ 0,00/mês**

## 📁 Estrutura

```
núcleo-bets/
├── backend/
│   ├── server.py          # API FastAPI completa
│   ├── requirements.txt   # Dependências Python
│   └── .env              # Configurações
├── frontend/
│   ├── src/
│   │   ├── App.js        # React app principal
│   │   ├── App.css       # Estilos customizados
│   │   └── index.js      # Entry point
│   ├── package.json      # Dependências Node
│   └── .env              # URL backend
└── DEPLOY_GUIDE.md       # Guia de deploy
```

## 🎨 Design

- **Cores:** Azul escuro + Roxo neon
- **Estilo:** Glassmorphism moderno
- **Background:** Gradientes profissionais
- **UI:** Limpa e intuitiva

## 🛡️ Segurança

- JWT tokens com expiração
- Senhas hasheadas com bcrypt
- Controle de roles (admin/user)
- Limpeza automática de dados expirados
- CORS configurado

---

**Núcleo Bets - Sistema profissional de análises de futebol**