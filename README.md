# Santos Barbearia API v2.1

**API completa e moderna para gerenciamento de barbearia com agendamento online.**

---

## 🚀 Funcionalidades Principais

- **Autenticação Segura** — JWT com Access Token + Refresh Token + Blacklist
- **Agendamentos Inteligentes** — Verificação de conflito de horário + Horário comercial configurável
- **Gestão de Serviços** — CRUD completo
- **Gestão de Produtos** — CRUD + Controle de estoque
- **Dashboard Admin** — Estatísticas, gerenciamento de agendamentos e usuários
- **Proteção de Rotas** — Baseado em roles (Admin / Cliente)

---

## 🛠️ Stack Tecnológica

| Tecnologia       | Descrição                    |
|------------------|------------------------------|
| **FastAPI**      | Framework web moderno        |
| **MongoDB**      | Banco de dados NoSQL         |
| **Motor**        | Driver async para MongoDB    |
| **Pydantic v2**  | Validação de dados           |
| **JWT**          | Autenticação stateless       |
| **Docker**       | Containerização              |

---

## 📦 Como Rodar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/hsstackfull/barber.git
cd barber

# 2. Backend
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/Mac

pip install -r requirements.txt

# Configure o .env
copy .env.example .env
# Edite o .env com suas credenciais

uvicorn app.main:app --reload
