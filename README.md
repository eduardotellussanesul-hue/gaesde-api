<p align="center">
  <a href="http://nestjs.com/" target="_blank"><img src="https://nestjs.com/img/logo-small.svg" width="110" alt="Nest Logo" /></a>
</p>

<h1 align="center">GAESDE API</h1>

<p align="center">
  API RESTful para uma plataforma completa de <strong>Gestão de Cursos Online (EAD)</strong>,
  construída com NestJS, MongoDB e arquitetura em camadas (DDD-inspired).
</p>

<p align="center">
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Socket.IO-realtime-010101?logo=socketdotio&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Node-20.x-339933?logo=nodedotjs&logoColor=white" alt="Node" />
  <img src="https://img.shields.io/badge/license-UNLICENSED-lightgrey" alt="License" />
</p>

---

## 📖 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Principais Funcionalidades](#-principais-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Stack Tecnológica](#-stack-tecnológica)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Executando o Projeto](#-executando-o-projeto)
- [Documentação da API (Swagger)](#-documentação-da-api-swagger)
- [Sistema de Comentários e Chat](#-sistema-de-comentários-e-chat)
- [WebSocket — Notificações em Tempo Real](#-websocket--notificações-em-tempo-real)
- [Autenticação](#-autenticação)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Testes](#-testes)
- [Deploy (Netlify)](#-deploy-netlify)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O **GAESDE API** é o backend de uma plataforma de ensino a distância (EAD). Ele gerencia
todo o ciclo de vida de cursos online: catálogo de cursos, matrículas de alunos,
progresso de aprendizagem, avaliações (quizzes), emissão de certificados e comunicação
entre professores e alunos (comentários e chat em tempo real).

A aplicação segue uma **arquitetura em camadas** inspirada em DDD, separando claramente
regras de negócio (domínio), casos de uso (aplicação), detalhes técnicos (infraestrutura)
e a camada de entrada HTTP/WebSocket (apresentação).

---

## ✨ Principais Funcionalidades

### 👤 Autenticação e Usuários
- Registro e login de usuários com **JWT**
- Senhas protegidas com **bcrypt**
- Sistema de **papéis (roles)**: Admin, Instrutor, Aluno
- Guards globais de autenticação e autorização

### 📚 Catálogo de Cursos
- **Categorias** hierárquicas (com subcategorias)
- **Cursos** com status (`draft`, `review`, `published`, `archived`) e níveis (`beginner`, `intermediate`, `advanced`)
- **Módulos** ordenáveis
- **Conteúdos** de vários tipos (vídeo, texto, PDF, quiz, assignment)

### 🎓 Jornada do Aluno
- **Matrículas** em cursos
- **Progresso** de aprendizagem automático
- **Conclusão de conteúdos** (content completion)
- **Certificados** gerados em PDF (via PDFKit) com verificação

### 📝 Avaliações
- **Quizzes** com questões (múltipla escolha, verdadeiro/falso, dissertativa)
- **Tentativas** e respostas dos alunos
- **Submissões de tarefas** (assignments)
- **Avaliações** de curso (reviews de 1 a 5 estrelas)

### 💬 Comunicação (Comentários e Chat)
- Comentários de curso e **chat** direto entre professor e alunos
- **Threads** (respostas aninhadas)
- **Anexos** de arquivos (via Cloudinary)
- **Reações** com emojis
- **Busca full-text** nas mensagens
- **Arquivamento** de conversas por usuário
- **Notificações em tempo real** via WebSocket

### 🖼️ Uploads
- Upload de imagens e arquivos para o **Cloudinary**

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│  Presentation  →  Controllers, DTOs, Gateways (HTTP/WS)      │
├─────────────────────────────────────────────────────────────┤
│  Application   →  Services (casos de uso), Modules           │
├─────────────────────────────────────────────────────────────┤
│  Domain        →  Entidades, Regras de negócio, Interfaces   │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure→  Mongoose, Auth, Cloudinary, Repositórios   │
└─────────────────────────────────────────────────────────────┘
```

- **Domain**: entidades puras (ex.: `Comment`, `Course`, `User`) com validações e sem dependências de framework.
- **Application**: orquestra os casos de uso e depende apenas de interfaces do domínio.
- **Infrastructure**: implementações concretas (Mongoose schemas, repositórios, serviços externos).
- **Presentation**: controllers REST, DTOs validados com `class-validator` e o gateway WebSocket.

O acoplamento é invertido via **injeção de dependência** (ex.: `ICommentRepository` → `CommentRepository`).

---

## 🧰 Stack Tecnológica

| Categoria         | Tecnologia                                             |
| ----------------- | ------------------------------------------------------ |
| Framework         | [NestJS 11](https://nestjs.com/)                       |
| Linguagem         | [TypeScript 5](https://www.typescriptlang.org/)        |
| Banco de dados    | [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/) |
| Autenticação      | JWT + Passport                                         |
| Tempo real        | [Socket.IO](https://socket.io/)                        |
| Uploads           | [Cloudinary](https://cloudinary.com/)                  |
| Geração de PDF    | [PDFKit](https://pdfkit.org/)                          |
| Documentação      | [Swagger / OpenAPI](https://swagger.io/)               |
| Validação         | class-validator / class-transformer                    |
| Deploy serverless | Netlify Functions (serverless-http)                    |

---

## ✅ Pré-requisitos

- **Node.js 20.x**
- **npm** (ou pnpm/yarn)
- Uma instância do **MongoDB** (local ou Atlas)
- Conta no **Cloudinary** (para uploads) — opcional em desenvolvimento

---

## 📦 Instalação

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd gaesde-api

# Instale as dependências
npm install
```

---

## 🔐 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de dados
MONGODB_URI=mongodb://localhost:27017/gaesde

# JWT
JWT_SECRET=troque-esta-chave-super-secreta
JWT_EXPIRES_IN=7d

# Cloudinary (uploads)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=seu_api_secret
```

> 💡 Em produção (`NODE_ENV=production`) ou em runtime serverless, o `MONGODB_URI` é obrigatório.

---

## ▶️ Executando o Projeto

```bash
# Desenvolvimento (watch mode)
npm run start:dev

# Desenvolvimento limpando a porta 3000 antes de iniciar
npm run start:dev:clean

# Modo debug
npm run start:debug

# Produção
npm run build
npm run start:prod
```

Ao iniciar, o console exibirá:

```
🚀 Application running on: http://localhost:3000
📚 Swagger available at:   http://localhost:3000/api/docs
📖 API JSON:               http://localhost:3000/api/docs-json
```

> 🌱 Na primeira execução, um **seed** cria automaticamente os papéis e o usuário administrador padrão:
> - **Email:** `admin@gaesde.com`
> - **Senha:** `Admin@123456`

---

## 📚 Documentação da API (Swagger)

A documentação interativa completa fica disponível em:

```
http://localhost:3000/api/docs
```

Nela você pode explorar todos os endpoints, ver os schemas de request/response e testar
as chamadas diretamente pelo navegador (use o botão **Authorize** para informar o token JWT).

---

## 💬 Sistema de Comentários e Chat

O módulo de comentários suporta dois tipos de comunicação:

| Tipo     | Descrição                                                            |
| -------- | ------------------------------------------------------------------- |
| `course` | Comentário do professor direcionado a N alunos matriculados no curso |
| `chat`   | Mensagem direta (com ou sem vínculo a um curso), suporta threads     |

### Principais endpoints

| Método   | Rota                                              | Descrição                               |
| -------- | ------------------------------------------------- | --------------------------------------- |
| `POST`   | `/comments`                                       | Criar comentário/mensagem               |
| `GET`    | `/comments`                                       | Listar todos (paginado)                 |
| `GET`    | `/comments/:id`                                   | Obter por ID                            |
| `GET`    | `/comments/course/:courseId`                      | Comentários de um curso (paginado)      |
| `GET`    | `/comments/author/:authorId`                      | Comentários de um autor (paginado)      |
| `GET`    | `/comments/recipient/:recipientId`                | Mensagens recebidas (paginado)          |
| `GET`    | `/comments/course/:courseId/student/:studentId`   | Comentários do curso para um aluno      |
| `GET`    | `/comments/replies/:parentId`                     | Respostas (thread) de um comentário     |
| `GET`    | `/comments/search?q=termo`                        | Busca full-text                         |
| `GET`    | `/comments/archived`                              | Conversas arquivadas do usuário         |
| `PATCH`  | `/comments/:id`                                   | Atualizar (somente autor)               |
| `DELETE` | `/comments/:id`                                   | Excluir permanentemente (somente autor) |
| `PATCH`  | `/comments/:id/soft-delete`                       | Exclusão lógica                         |
| `POST`   | `/comments/:id/reactions`                         | Adicionar/trocar reação (emoji)         |
| `DELETE` | `/comments/:id/reactions`                         | Remover reação                          |
| `POST`   | `/comments/:id/attachments`                       | Anexar arquivo                          |
| `DELETE` | `/comments/:id/attachments/:publicId`             | Remover anexo                           |
| `PATCH`  | `/comments/:id/archive` \| `/unarchive`           | Arquivar/desarquivar conversa           |

### Exemplo — professor envia feedback para vários alunos

```bash
curl -X POST http://localhost:3000/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "course",
    "content": "Excelente trabalho na atividade desta semana!",
    "authorId": "<professor_id>",
    "courseId": "<curso_id>",
    "recipientIds": ["<aluno_1>", "<aluno_2>", "<aluno_3>"]
  }'
```

### Exemplo — aluno responde (thread de chat)

```bash
curl -X POST http://localhost:3000/comments \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "chat",
    "content": "Obrigado, professor!",
    "authorId": "<aluno_id>",
    "recipientIds": ["<professor_id>"],
    "parentId": "<id_do_comentario_original>"
  }'
```

---

## 🔔 WebSocket — Notificações em Tempo Real

O sistema emite eventos em tempo real via **Socket.IO** no namespace `/comments`.

### Conexão do cliente

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/comments', {
  query: { userId: '<seu_user_id>' },
  transports: ['websocket'],
});

socket.on('comment:new', (comment) => {
  console.log('Nova mensagem recebida:', comment);
});
```

### Eventos emitidos

| Evento              | Quando é disparado                          |
| ------------------- | ------------------------------------------- |
| `comment:new`       | Um novo comentário/mensagem é criado        |
| `comment:updated`   | Um comentário é atualizado                  |
| `comment:deleted`   | Um comentário é removido                    |
| `comment:reaction`  | Uma reação é adicionada/removida            |

Cada usuário entra automaticamente na sala `user:{id}`. É possível também entrar na sala
de um curso com o evento `joinCourse` (`{ courseId }`) para receber eventos daquele curso.

---

## 🔑 Autenticação

A API usa **JWT Bearer Token**. Fluxo básico:

```bash
# 1. Login
curl -X POST http://localhost:3000/users/login \
  -H "Content-Type: application/json" \
  -d '{ "email": "admin@gaesde.com", "password": "Admin@123456" }'

# Resposta:
# { "access_token": "eyJhbGciOi...", "user": { ... } }

# 2. Use o token nas requisições protegidas
curl http://localhost:3000/comments \
  -H "Authorization: Bearer eyJhbGciOi..."
```

O payload do token expõe `req.user.userId` e `req.user.email` nos controllers.

---

## 📁 Estrutura de Pastas

```
src/
├── app.module.ts              # Módulo raiz
├── main.ts                    # Bootstrap HTTP
├── lambda.ts                  # Entry point serverless (Netlify)
├── bootstrap.ts               # Configuração da aplicação + Swagger
│
├── config/                    # Configuração e variáveis de ambiente
│
├── domain/                    # Regras de negócio (entidades + interfaces)
│   ├── comment/
│   ├── course/
│   ├── user/
│   └── ...
│
├── application/               # Casos de uso (services + modules)
│   ├── comment/
│   ├── course/
│   ├── enrollment/
│   └── ...
│
├── infrastructure/            # Detalhes técnicos
│   ├── auth/                  # JWT, Passport, Guards
│   ├── database/              # Conexão + seed
│   ├── cloudinary/            # Uploads
│   └── repositories/          # Implementações Mongoose
│
└── presentation/              # Camada de entrada
    ├── controllers/           # Endpoints REST
    ├── dtos/                  # Data Transfer Objects
    └── gateways/              # WebSocket Gateways
```

---

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:cov

# Testes end-to-end
npm run test:e2e
```

Na pasta `scripts/` também existem scripts shell (`.sh`) para testar manualmente os
fluxos da API (quizzes, matrículas, certificados etc.).

---

## ☁️ Deploy (Netlify)

O projeto está preparado para rodar como **função serverless** na Netlify:

- `src/lambda.ts` — adaptador serverless (usando `serverless-http`)
- `netlify/functions/` — ponto de entrada das functions
- `netlify.toml` — configuração de build e redirects

```bash
# Build de produção
npm run build
```

O deploy é feito publicando o diretório na Netlify, que executa a API via AWS Lambda por baixo dos panos.

---

## 📜 Scripts Disponíveis

| Script                   | Descrição                                        |
| ------------------------ | ------------------------------------------------ |
| `npm run start`          | Inicia a aplicação                               |
| `npm run start:dev`      | Inicia em modo watch (desenvolvimento)           |
| `npm run start:dev:clean`| Libera a porta 3000 e inicia em watch            |
| `npm run start:debug`    | Inicia em modo debug                             |
| `npm run start:prod`     | Inicia a build de produção (`dist/main`)         |
| `npm run build`          | Compila o projeto                                |
| `npm run format`         | Formata o código com Prettier                    |
| `npm run lint`           | Executa o ESLint com correção automática         |
| `npm run test`           | Executa os testes unitários                      |
| `npm run test:e2e`       | Executa os testes end-to-end                     |
| `npm run test:cov`       | Gera relatório de cobertura                       |

---

## 📄 Licença

Este projeto está sob a licença **UNLICENSED** (uso privado). Consulte a equipe do
GAESDE para informações sobre uso e distribuição.

---

<p align="center">
  Feito com ❤️ usando <a href="https://nestjs.com/">NestJS</a>
</p>