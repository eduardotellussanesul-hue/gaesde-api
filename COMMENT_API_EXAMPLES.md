# 📝 Exemplos de Uso - Sistema de Comentários

## Configuração Base
Todas as requisições requerem autenticação JWT:
```
Authorization: Bearer {seu_token_jwt}
Content-Type: application/json
```

---

## 1️⃣ Criar Comentário de Curso

**POST** `/comments`

### Professor envia comentário para N alunos do curso:
```json
{
  "type": "course",
  "content": "Excelente trabalho na atividade! Continuem assim.",
  "authorId": "prof-id-123",
  "courseId": "course-id-456",
  "recipientIds": [
    "student-id-1",
    "student-id-2",
    "student-id-3"
  ]
}
```

**Resposta (201)**:
```json
{
  "id": "comment-id-789",
  "type": "course",
  "content": "Excelente trabalho na atividade! Continuem assim.",
  "authorId": "prof-id-123",
  "courseId": "course-id-456",
  "recipientIds": ["student-id-1", "student-id-2", "student-id-3"],
  "parentId": null,
  "createdAt": "2025-07-11T10:30:00Z",
  "updatedAt": "2025-07-11T10:30:00Z",
  "isDeleted": false
}
```

---

## 2️⃣ Criar Resposta/Reply (Chat)

**POST** `/comments`

### Aluno responde ao comentário do professor:
```json
{
  "type": "chat",
  "content": "Obrigado professor! Vou continuar melhorando.",
  "authorId": "student-id-1",
  "courseId": "course-id-456",
  "recipientIds": ["prof-id-123"],
  "parentId": "comment-id-789"
}
```

---

## 3️⃣ Listar Comentários do Curso

**GET** `/comments/course/course-id-456`

**Resposta (200)**:
```json
[
  {
    "id": "comment-id-789",
    "type": "course",
    "content": "Excelente trabalho na atividade! Continuem assim.",
    "authorId": "prof-id-123",
    "courseId": "course-id-456",
    "recipientIds": ["student-id-1", "student-id-2", "student-id-3"],
    "createdAt": "2025-07-11T10:30:00Z",
    "updatedAt": "2025-07-11T10:30:00Z",
    "isDeleted": false
  },
  {
    "id": "comment-id-790",
    "type": "course",
    "content": "Não esqueçam da deadline de amanhã.",
    "authorId": "prof-id-123",
    "courseId": "course-id-456",
    "recipientIds": ["student-id-1", "student-id-2"],
    "createdAt": "2025-07-11T11:00:00Z",
    "updatedAt": "2025-07-11T11:00:00Z",
    "isDeleted": false
  }
]
```

---

## 4️⃣ Listar Comentários Recebidos pelo Aluno

**GET** `/comments/recipient/student-id-1`

Retorna todos os comentários (course e chat) que o aluno recebeu.

---

## 5️⃣ Listar Comentários do Curso para Aluno Específico

**GET** `/comments/course/course-id-456/student/student-id-1`

Retorna apenas os comentários de curso direcionados para esse aluno específico.

---

## 6️⃣ Listar Respostas a um Comentário

**GET** `/comments/replies/comment-id-789`

**Resposta (200)**:
```json
[
  {
    "id": "comment-id-791",
    "type": "chat",
    "content": "Obrigado professor! Vou continuar melhorando.",
    "authorId": "student-id-1",
    "courseId": "course-id-456",
    "recipientIds": ["prof-id-123"],
    "parentId": "comment-id-789",
    "createdAt": "2025-07-11T10:45:00Z",
    "updatedAt": "2025-07-11T10:45:00Z",
    "isDeleted": false
  }
]
```

---

## 7️⃣ Obter Comentário por ID

**GET** `/comments/comment-id-789`

---

## 8️⃣ Atualizar Comentário

**PATCH** `/comments/comment-id-789`

```json
{
  "content": "Conteúdo atualizado do comentário"
}
```

Apenas o autor (professor) pode atualizar seu comentário.

---

## 9️⃣ Deletar Comentário (Soft Delete)

**PATCH** `/comments/comment-id-789/soft-delete`

O comentário é marcado como deletado mas permanece no banco de dados.

---

## 🔟 Deletar Comentário (Hard Delete)

**DELETE** `/comments/comment-id-789`

O comentário é permanentemente removido do banco de dados.

---

## 📊 Listar Comentários por Professor

**GET** `/comments/author/prof-id-123`

Retorna todos os comentários criados por esse professor.

---

## 🔍 Obter Todos os Comentários

**GET** `/comments`

---

## ⚠️ Códigos de Erro

| Status | Erro | Causa |
|--------|------|-------|
| 400 | Bad Request | Dados inválidos ou faltando courseId para comentário de curso |
| 403 | Forbidden | Apenas o autor pode atualizar/deletar |
| 404 | Not Found | Comentário não encontrado |
| 401 | Unauthorized | Token JWT inválido ou ausente |

---

## 🏗️ Estrutura de Dados

### Comment
```typescript
{
  id: string                  // ID do comentário
  type: 'course' | 'chat'     // Tipo de comentário
  content: string             // Conteúdo (até 5000 caracteres)
  authorId: string            // ID do criador (professor/aluno)
  courseId?: string           // ID do curso (obrigatório para type='course')
  recipientIds: string[]      // IDs dos alunos que recebem
  parentId?: string           // ID do comentário pai (para replies)
  createdAt: Date
  updatedAt: Date
  isDeleted: boolean
}
```

---

## 💡 Casos de Uso

### Cenário 1: Professor envia feedback para turma
1. Professor cria comment com type='course'
2. Adiciona todos os alunos do curso em recipientIds
3. Alunos recebem a menagem

### Cenário 2: Chat entre professor e aluno
1. Professor cria comment com type='chat'
2. recipientIds contém apenas o student-id
3. Student responde com parentId apontando para o comment original
4. Ambos conseguem ver o histórico na thread

### Cenário 3: Aluno pergunta para professor
1. Aluno cria comment com type='chat'
2. authorId = student-id
3. recipientIds = [prof-id]
4. Professor pode ver em /comments/recipient/prof-id
