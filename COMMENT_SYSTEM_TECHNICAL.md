# 🗨️ Sistema de Comentários - Documentação Técnica

## 📋 Visão Geral

Sistema completo de comentários para cursos que permite:
- ✅ Professores enviam comentários para N alunos matriculados no curso
- ✅ Alunos respondem via chat ou comentários do curso
- ✅ Rastreamento de informações de professor e alunos
- ✅ Histórico completo de conversas
- ✅ Suporte a threads (respostas aninhadas)

---

## 📁 Estrutura de Arquivos

```
src/
├── domain/comment/
│   ├── comment.entity.ts                 # Entidade principal
│   ├── comment.exceptions.ts             # Exceções customizadas
│   └── comment.repository.interface.ts   # Interface do repositório
│
├── application/comment/
│   ├── comment.service.ts                # Lógica de negócio
│   └── comment.module.ts                 # Módulo NestJS
│
├── infrastructure/repositories/
│   └── comment.repository.impl.ts        # Implementação com Mongoose
│
└── presentation/
    ├── controllers/comments/
    │   └── comment.controller.ts         # Endpoints REST
    └── dtos/
        └── comment.dto.ts                # DTOs com validações
```

---

## 🗄️ Esquema MongoDB

### Coleção: `comments`

```javascript
{
  _id: ObjectId,
  type: String,              // 'course' ou 'chat'
  content: String,           // Até 5000 caracteres
  author_id: String,         // ID do User (professor/aluno)
  course_id: String,         // ID do Course (opcional)
  recipient_ids: [String],   // Array de IDs de Users
  parent_id: String,         // ID do Comment pai (para replies)
  created_at: Date,
  updated_at: Date,
  deleted_at: Date           // null = ativo, Date = deletado
}
```

### Índices Criados

```javascript
// Queries por tipo
{ type: 1, created_at: -1 }

// Buscar comentários de um curso
{ course_id: 1, created_at: -1 }

// Buscar comentários de um autor
{ author_id: 1, created_at: -1 }

// Buscar comentários recebidos
{ recipient_ids: 1, created_at: -1 }

// Buscar respostas
{ parent_id: 1 }
```

---

## 🏗️ Camadas da Aplicação

### Domain (Lógica de Negócio)

**comment.entity.ts**
```typescript
export enum CommentType {
  COURSE = 'course',
  CHAT = 'chat'
}

export class Comment {
  // Validações
  - content: 1-5000 caracteres
  - type: deve ser COURSE ou CHAT
  - recipientIds: mínimo 1 aluno
  - Se type=COURSE: courseId obrigatório
  
  // Métodos
  - delete(): marca como deletado
  - restore(): restaura comentário
}
```

**comment.repository.interface.ts**
```typescript
interface ICommentRepository {
  save(comment: Comment): Promise<Comment>
  findById(id: string): Promise<Comment | null>
  findByCourseId(courseId: string): Promise<Comment[]>
  findByAuthorId(authorId: string): Promise<Comment[]>
  findByRecipientId(recipientId: string): Promise<Comment[]>
  findCourseCommentsByRecipient(courseId, recipientId): Promise<Comment[]>
  findReplies(parentId: string): Promise<Comment[]>
  update(id: string, data: Partial<Comment>): Promise<Comment | null>
  delete(id: string): Promise<void>
  softDelete(id: string): Promise<Comment | null>
}
```

### Application (Lógica de Aplicação)

**comment.service.ts**

Métodos principais:
- `create(dto)`: Cria novo comentário
- `findById(id)`: Obtém comentário
- `findByCourseId(courseId)`: Lista comentários do curso
- `findByAuthorId(authorId)`: Lista comentários do professor
- `findByRecipientId(recipientId)`: Lista comentários recebidos
- `findCourseCommentsByRecipient(courseId, recipientId)`: Comentários do curso para aluno
- `findReplies(parentId)`: Respostas a um comentário
- `update(id, userId, dto)`: Atualiza (autorização verificada)
- `delete(id, userId)`: Deleta permanentemente
- `softDelete(id, userId)`: Soft delete

Autorizações:
- ✅ Apenas autor pode atualizar
- ✅ Apenas autor pode deletar
- ✅ JWT obrigatório em todos os endpoints

### Presentation (Controllers e DTOs)

**comment.controller.ts**

Endpoints:
```
POST   /comments                              # Criar
GET    /comments/:id                          # Obter por ID
GET    /comments                              # Listar todos
GET    /comments/course/:courseId             # Por curso
GET    /comments/author/:authorId             # Por professor
GET    /comments/recipient/:recipientId       # Recebidos por aluno
GET    /comments/course/:courseId/student/:studentId  # Curso + Aluno
GET    /comments/replies/:parentId            # Respostas
PATCH  /comments/:id                          # Atualizar
DELETE /comments/:id                          # Deletar (hard)
PATCH  /comments/:id/soft-delete              # Deletar (soft)
```

**comment.dto.ts**

```typescript
CreateCommentDto {
  type: CommentType          # 'course' ou 'chat'
  content: string            # 1-5000 caracteres
  authorId: string
  recipientIds: string[]     # Mínimo 1
  courseId?: string          # Obrigatório se type='course'
  parentId?: string          # Para replies
}

UpdateCommentDto {
  content?: string
  recipientIds?: string[]
}

CommentResponseDto {
  id: string
  type: CommentType
  content: string
  authorId: string
  courseId?: string
  recipientIds: string[]
  parentId?: string
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}
```

### Infrastructure (Persistência)

**comment.repository.impl.ts**

```typescript
export const CommentSchema = new Schema<CommentDocument>({
  type: { type: String, enum: ['course', 'chat'], required: true }
  content: { type: String, required: true, maxlength: 5000 }
  author_id: { type: String, required: true, ref: 'User' }
  course_id: { type: String, ref: 'Course' }
  recipient_ids: { type: [String], required: true, ref: 'User' }
  parent_id: { type: String, ref: 'Comment' }
  deleted_at: { type: Date, default: null }
})

export class CommentRepository implements ICommentRepository {
  // Implementações de todas as queries
  // Com suporte a soft delete (filtra deleted_at: null)
}
```

---

## 🔐 Segurança

### Autenticação
- JWT Bearer Token obrigatório
- Integrado com `JwtAuthGuard`
- Decoradores de Role disponíveis globalmente

### Autorização
- Create: Qualquer usuário autenticado
- Update: Apenas o autor
- Delete: Apenas o autor
- Read: Qualquer usuário autenticado

### Validação
- DTOs com class-validator
- Regras de negócio na entidade
- Mensagens de erro claras

---

## 📊 Casos de Uso Implementados

### 1. Professor envia feedback para turma
```
Professor (author_id) cria comment com type='course'
recipient_ids = [aluno1, aluno2, aluno3]
courseId = curso-xyz
Todos os alunos veem a notificação
```

### 2. Aluno responde ao professor
```
Aluno cria comment com type='chat'
parentId = comment_id_original
authorId = aluno-id
recipientIds = [prof-id]
Form uma thread de conversa
```

### 3. Professor contata aluno específico
```
Professor cria comment com type='course'
courseId = curso-xyz
recipientIds = [aluno-id]
Mensagem privada dentro do contexto do curso
```

### 4. Thread de discussão
```
professor cria comment (type='chat')
  aluno1 responde (parentId = comment_id)
    professor responde (parentId = comment_id)
      aluno1 responde novamente
```

---

## 🚀 Como Usar

### 1. Instalar dependências
```bash
npm install
```

### 2. Iniciar desenvolvimento
```bash
npm run start:dev
```

### 3. Acessar Swagger
```
http://localhost:3000/api/docs
```

### 4. Testar endpoints
Ver arquivo `COMMENT_API_EXAMPLES.md`

---

## 🔧 Configuração

Nenhuma configuração adicional necessária. O módulo é automaticamente carregado via `AppModule`.

---

## 📈 Performance

### Queries Otimizadas
```typescript
// Comentários mais recentes do curso
{ course_id: 1, created_at: -1 }

// Thread by replies
{ parent_id: 1 }

// Mensagens para usuário
{ recipient_ids: 1, created_at: -1 }
```

### Soft Delete
- Comentários deletados não aparecem em queries
- Dados preservados para auditoria
- Índice em `deleted_at` para cleanup periódico

---

## 🧪 Testes

Execute testes com:
```bash
npm run test
npm run test:e2e
```

---

## 📝 Notas Importantes

1. **Validações obrigatórias**
   - Comment content é obrigatório (não pode vazio)
   - recipientIds deve ter mínimo 1 elemento
   - type deve ser 'course' ou 'chat'
   - courseId é obrigatório para type='course'

2. **Autorização**
   - Apenas o author pode update/delete seus comentários
   - Recipients **não podem** editar as mensagens recebidas
   - Apenas ler/responder

3. **Threads**
   - parentId liga a uma resposta
   - findReplies retorna ordenadas por data ascendente
   - Sem limite de profundidade de nesting

4. **Integração Future**
   - Webhooks para notificações em tempo real
   - Attachments/Arquivos
   - Reações (likes, etc)
   - Busca full-text

---

## 📞 Suporte

Para dúvidas ou issues:
1. Verificar `COMMENT_API_EXAMPLES.md`
2. Consultarcódigo-fonte em `src/`
3. Testar no Swagger UI em `/api/docs`
