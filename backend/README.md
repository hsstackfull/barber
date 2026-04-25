\# Santos Barbearia API v2.1



API completa para gerenciamento de barbearia moderna.



\## Tecnologias



\- \*\*FastAPI\*\* + Uvicorn

\- \*\*MongoDB\*\* (Motor Async)

\- \*\*JWT\*\* Authentication

\- \*\*Pydantic v2\*\*

\- Docker + Docker Compose



\## Funcionalidades



\- Cadastro e Login com JWT (Access + Refresh Token)

\- Agendamentos com validação de horário comercial

\- Gerenciamento de Serviços e Produtos

\- Dashboard Admin completo

\- Proteção de rotas por roles



\## Como Rodar



```bash

\# 1. Clone o repositório

git clone <seu-repo>

cd backend



\# 2. Crie o ambiente

python -m venv venv

venv\\Scripts\\activate



\# 3. Instale dependências

pip install -r requirements.txt



\# 4. Configure o .env

copy .env.example .env

\# Edite o .env com suas credenciais



\# 5. Rode a API

uvicorn app.main:app --reload

