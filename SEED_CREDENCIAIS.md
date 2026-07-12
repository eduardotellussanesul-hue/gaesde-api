# 🌱 GAESDE — Documento de Seed de Dados e Credenciais

> Gerado em: 11/07/2026 14:38

Este documento registra **todos os dados criados** no processo de povoamento (seed) da plataforma GAESDE, incluindo **usuários, senhas, cursos, módulos e matrículas**. Todo o cadastro foi feito via **API REST** (endpoints/URLs).

⚠️ **Aviso de segurança:** as senhas abaixo são padrão de ambiente de teste. Em produção, altere-as e nunca versione este arquivo em repositório público.

---

## 📊 Resumo

| Item | Quantidade |
| --- | ---: |
| Administrador | 1 |
| Professores (instructor) | 3 |
| Cursos | 6 |
| Módulos | 18 |
| Conteúdos (vídeo + texto + quiz) | 54 |
| Quizzes | 18 |
| Alunos (student) | 100 |
| Matrículas | 233 |

---

## 🧭 Passos executados (fluxo de registro via API)

Base da API (local durante o seed): `http://localhost:3000` — Produção: `https://gaesdeapi.netlify.app`

1. **Limpeza do banco** (`test`) mantendo apenas o administrador, os *roles* (`admin`, `instructor`, `student`) e o vínculo de role do admin.
2. **Login do admin** em `POST /users/login` para obter o token JWT.
3. **Leitura dos roles** em `GET /roles`.
4. Para cada **professor**:
   - `POST /users/register` (multipart) para criar o usuário.
   - `POST /user-roles/assign` para atribuir o role **instructor**.
   - Login do professor e `POST /courses` para criar **2 cursos** (o `instructorId` vem do token do professor).
5. Para cada **curso** (via token admin): `POST /modules` (3 módulos) e, em cada módulo, `POST /contents` para **vídeo**, **texto** e **quiz**:
   - Vídeo: `POST /contents/{id}/video`
   - Texto: `POST /contents/{id}/text`
   - Quiz: `POST /quizzes` + `POST /questions` (3 questões) + `POST /question-options`.
6. **100 alunos**: `POST /users/register` + `POST /user-roles/assign` (role **student**).
7. **Matrículas**: `POST /enrollments/assign` garantindo que **cada aluno fique em pelo menos 2 cursos** (parte deles em 3).

---

## 👑 Administrador Master

| Nome | Email | Senha |
| --- | --- | --- |
| Administrador Master | `admin@gaesde.com` | `Admin@123456` |

---

## 👨‍🏫 Professores

Senha padrão dos professores: **`Prof@123456`**

| Área | Nome | Email | Senha | Cursos |
| --- | --- | --- | --- | --- |
| Programacao | Prof. Carlos Programador | `prof.programacao@gaesde.com` | `Prof@123456` | Logica de Programacao; Desenvolvimento Web com JavaScript |
| Biologia | Profa. Beatriz Bio | `prof.biologia@gaesde.com` | `Prof@123456` | Biologia Celular; Genetica e Evolucao |
| Historia | Prof. Henrique Historia | `prof.historia@gaesde.com` | `Prof@123456` | Historia do Brasil; Historia Antiga e Medieval |

---

## 📚 Cursos, Módulos e Conteúdos

Cada curso possui **3 módulos**, e cada módulo contém **1 vídeo**, **1 texto explicativo** e **1 questionário (quiz)** com 3 questões.

### Logica de Programacao

- **Área:** Programacao
- **Professor:** `prof.programacao@gaesde.com`
- **Slug:** `logica-de-programacao`
- **Alunos matriculados:** 33
- **Módulos:**
  - Modulo 1 - Introducao — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 2 - Conceitos Fundamentais — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 3 - Aplicacoes Praticas — conteúdos: vídeo, texto, quiz (3 questões)

### Desenvolvimento Web com JavaScript

- **Área:** Programacao
- **Professor:** `prof.programacao@gaesde.com`
- **Slug:** `desenvolvimento-web-com-javascript`
- **Alunos matriculados:** 50
- **Módulos:**
  - Modulo 1 - Introducao — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 2 - Conceitos Fundamentais — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 3 - Aplicacoes Praticas — conteúdos: vídeo, texto, quiz (3 questões)

### Biologia Celular

- **Área:** Biologia
- **Professor:** `prof.biologia@gaesde.com`
- **Slug:** `biologia-celular`
- **Alunos matriculados:** 33
- **Módulos:**
  - Modulo 1 - Introducao — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 2 - Conceitos Fundamentais — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 3 - Aplicacoes Praticas — conteúdos: vídeo, texto, quiz (3 questões)

### Genetica e Evolucao

- **Área:** Biologia
- **Professor:** `prof.biologia@gaesde.com`
- **Slug:** `genetica-e-evolucao`
- **Alunos matriculados:** 34
- **Módulos:**
  - Modulo 1 - Introducao — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 2 - Conceitos Fundamentais — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 3 - Aplicacoes Praticas — conteúdos: vídeo, texto, quiz (3 questões)

### Historia do Brasil

- **Área:** Historia
- **Professor:** `prof.historia@gaesde.com`
- **Slug:** `historia-do-brasil`
- **Alunos matriculados:** 50
- **Módulos:**
  - Modulo 1 - Introducao — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 2 - Conceitos Fundamentais — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 3 - Aplicacoes Praticas — conteúdos: vídeo, texto, quiz (3 questões)

### Historia Antiga e Medieval

- **Área:** Historia
- **Professor:** `prof.historia@gaesde.com`
- **Slug:** `historia-antiga-e-medieval`
- **Alunos matriculados:** 33
- **Módulos:**
  - Modulo 1 - Introducao — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 2 - Conceitos Fundamentais — conteúdos: vídeo, texto, quiz (3 questões)
  - Modulo 3 - Aplicacoes Praticas — conteúdos: vídeo, texto, quiz (3 questões)

---

## 👨‍🎓 Alunos

Total: **100 alunos**. Senha padrão de todos: **`Aluno@123456`**

Emails no padrão `aluno001@gaesde.com` … `aluno100@gaesde.com`.

<details><summary>📋 Lista completa dos 100 alunos (clique para expandir)</summary>

| # | Nome | Email | Senha | Cursos matriculados |
| ---: | --- | --- | --- | ---: |
| 1 | Aluno 001 | `aluno001@gaesde.com` | `Aluno@123456` | 2 |
| 2 | Aluno 002 | `aluno002@gaesde.com` | `Aluno@123456` | 2 |
| 3 | Aluno 003 | `aluno003@gaesde.com` | `Aluno@123456` | 3 |
| 4 | Aluno 004 | `aluno004@gaesde.com` | `Aluno@123456` | 2 |
| 5 | Aluno 005 | `aluno005@gaesde.com` | `Aluno@123456` | 2 |
| 6 | Aluno 006 | `aluno006@gaesde.com` | `Aluno@123456` | 3 |
| 7 | Aluno 007 | `aluno007@gaesde.com` | `Aluno@123456` | 2 |
| 8 | Aluno 008 | `aluno008@gaesde.com` | `Aluno@123456` | 2 |
| 9 | Aluno 009 | `aluno009@gaesde.com` | `Aluno@123456` | 3 |
| 10 | Aluno 010 | `aluno010@gaesde.com` | `Aluno@123456` | 2 |
| 11 | Aluno 011 | `aluno011@gaesde.com` | `Aluno@123456` | 2 |
| 12 | Aluno 012 | `aluno012@gaesde.com` | `Aluno@123456` | 3 |
| 13 | Aluno 013 | `aluno013@gaesde.com` | `Aluno@123456` | 2 |
| 14 | Aluno 014 | `aluno014@gaesde.com` | `Aluno@123456` | 2 |
| 15 | Aluno 015 | `aluno015@gaesde.com` | `Aluno@123456` | 3 |
| 16 | Aluno 016 | `aluno016@gaesde.com` | `Aluno@123456` | 2 |
| 17 | Aluno 017 | `aluno017@gaesde.com` | `Aluno@123456` | 2 |
| 18 | Aluno 018 | `aluno018@gaesde.com` | `Aluno@123456` | 3 |
| 19 | Aluno 019 | `aluno019@gaesde.com` | `Aluno@123456` | 2 |
| 20 | Aluno 020 | `aluno020@gaesde.com` | `Aluno@123456` | 2 |
| 21 | Aluno 021 | `aluno021@gaesde.com` | `Aluno@123456` | 3 |
| 22 | Aluno 022 | `aluno022@gaesde.com` | `Aluno@123456` | 2 |
| 23 | Aluno 023 | `aluno023@gaesde.com` | `Aluno@123456` | 2 |
| 24 | Aluno 024 | `aluno024@gaesde.com` | `Aluno@123456` | 3 |
| 25 | Aluno 025 | `aluno025@gaesde.com` | `Aluno@123456` | 2 |
| 26 | Aluno 026 | `aluno026@gaesde.com` | `Aluno@123456` | 2 |
| 27 | Aluno 027 | `aluno027@gaesde.com` | `Aluno@123456` | 3 |
| 28 | Aluno 028 | `aluno028@gaesde.com` | `Aluno@123456` | 2 |
| 29 | Aluno 029 | `aluno029@gaesde.com` | `Aluno@123456` | 2 |
| 30 | Aluno 030 | `aluno030@gaesde.com` | `Aluno@123456` | 3 |
| 31 | Aluno 031 | `aluno031@gaesde.com` | `Aluno@123456` | 2 |
| 32 | Aluno 032 | `aluno032@gaesde.com` | `Aluno@123456` | 2 |
| 33 | Aluno 033 | `aluno033@gaesde.com` | `Aluno@123456` | 3 |
| 34 | Aluno 034 | `aluno034@gaesde.com` | `Aluno@123456` | 2 |
| 35 | Aluno 035 | `aluno035@gaesde.com` | `Aluno@123456` | 2 |
| 36 | Aluno 036 | `aluno036@gaesde.com` | `Aluno@123456` | 3 |
| 37 | Aluno 037 | `aluno037@gaesde.com` | `Aluno@123456` | 2 |
| 38 | Aluno 038 | `aluno038@gaesde.com` | `Aluno@123456` | 2 |
| 39 | Aluno 039 | `aluno039@gaesde.com` | `Aluno@123456` | 3 |
| 40 | Aluno 040 | `aluno040@gaesde.com` | `Aluno@123456` | 2 |
| 41 | Aluno 041 | `aluno041@gaesde.com` | `Aluno@123456` | 2 |
| 42 | Aluno 042 | `aluno042@gaesde.com` | `Aluno@123456` | 3 |
| 43 | Aluno 043 | `aluno043@gaesde.com` | `Aluno@123456` | 2 |
| 44 | Aluno 044 | `aluno044@gaesde.com` | `Aluno@123456` | 2 |
| 45 | Aluno 045 | `aluno045@gaesde.com` | `Aluno@123456` | 3 |
| 46 | Aluno 046 | `aluno046@gaesde.com` | `Aluno@123456` | 2 |
| 47 | Aluno 047 | `aluno047@gaesde.com` | `Aluno@123456` | 2 |
| 48 | Aluno 048 | `aluno048@gaesde.com` | `Aluno@123456` | 3 |
| 49 | Aluno 049 | `aluno049@gaesde.com` | `Aluno@123456` | 2 |
| 50 | Aluno 050 | `aluno050@gaesde.com` | `Aluno@123456` | 2 |
| 51 | Aluno 051 | `aluno051@gaesde.com` | `Aluno@123456` | 3 |
| 52 | Aluno 052 | `aluno052@gaesde.com` | `Aluno@123456` | 2 |
| 53 | Aluno 053 | `aluno053@gaesde.com` | `Aluno@123456` | 2 |
| 54 | Aluno 054 | `aluno054@gaesde.com` | `Aluno@123456` | 3 |
| 55 | Aluno 055 | `aluno055@gaesde.com` | `Aluno@123456` | 2 |
| 56 | Aluno 056 | `aluno056@gaesde.com` | `Aluno@123456` | 2 |
| 57 | Aluno 057 | `aluno057@gaesde.com` | `Aluno@123456` | 3 |
| 58 | Aluno 058 | `aluno058@gaesde.com` | `Aluno@123456` | 2 |
| 59 | Aluno 059 | `aluno059@gaesde.com` | `Aluno@123456` | 2 |
| 60 | Aluno 060 | `aluno060@gaesde.com` | `Aluno@123456` | 3 |
| 61 | Aluno 061 | `aluno061@gaesde.com` | `Aluno@123456` | 2 |
| 62 | Aluno 062 | `aluno062@gaesde.com` | `Aluno@123456` | 2 |
| 63 | Aluno 063 | `aluno063@gaesde.com` | `Aluno@123456` | 3 |
| 64 | Aluno 064 | `aluno064@gaesde.com` | `Aluno@123456` | 2 |
| 65 | Aluno 065 | `aluno065@gaesde.com` | `Aluno@123456` | 2 |
| 66 | Aluno 066 | `aluno066@gaesde.com` | `Aluno@123456` | 3 |
| 67 | Aluno 067 | `aluno067@gaesde.com` | `Aluno@123456` | 2 |
| 68 | Aluno 068 | `aluno068@gaesde.com` | `Aluno@123456` | 2 |
| 69 | Aluno 069 | `aluno069@gaesde.com` | `Aluno@123456` | 3 |
| 70 | Aluno 070 | `aluno070@gaesde.com` | `Aluno@123456` | 2 |
| 71 | Aluno 071 | `aluno071@gaesde.com` | `Aluno@123456` | 2 |
| 72 | Aluno 072 | `aluno072@gaesde.com` | `Aluno@123456` | 3 |
| 73 | Aluno 073 | `aluno073@gaesde.com` | `Aluno@123456` | 2 |
| 74 | Aluno 074 | `aluno074@gaesde.com` | `Aluno@123456` | 2 |
| 75 | Aluno 075 | `aluno075@gaesde.com` | `Aluno@123456` | 3 |
| 76 | Aluno 076 | `aluno076@gaesde.com` | `Aluno@123456` | 2 |
| 77 | Aluno 077 | `aluno077@gaesde.com` | `Aluno@123456` | 2 |
| 78 | Aluno 078 | `aluno078@gaesde.com` | `Aluno@123456` | 3 |
| 79 | Aluno 079 | `aluno079@gaesde.com` | `Aluno@123456` | 2 |
| 80 | Aluno 080 | `aluno080@gaesde.com` | `Aluno@123456` | 2 |
| 81 | Aluno 081 | `aluno081@gaesde.com` | `Aluno@123456` | 3 |
| 82 | Aluno 082 | `aluno082@gaesde.com` | `Aluno@123456` | 2 |
| 83 | Aluno 083 | `aluno083@gaesde.com` | `Aluno@123456` | 2 |
| 84 | Aluno 084 | `aluno084@gaesde.com` | `Aluno@123456` | 3 |
| 85 | Aluno 085 | `aluno085@gaesde.com` | `Aluno@123456` | 2 |
| 86 | Aluno 086 | `aluno086@gaesde.com` | `Aluno@123456` | 2 |
| 87 | Aluno 087 | `aluno087@gaesde.com` | `Aluno@123456` | 3 |
| 88 | Aluno 088 | `aluno088@gaesde.com` | `Aluno@123456` | 2 |
| 89 | Aluno 089 | `aluno089@gaesde.com` | `Aluno@123456` | 2 |
| 90 | Aluno 090 | `aluno090@gaesde.com` | `Aluno@123456` | 3 |
| 91 | Aluno 091 | `aluno091@gaesde.com` | `Aluno@123456` | 2 |
| 92 | Aluno 092 | `aluno092@gaesde.com` | `Aluno@123456` | 2 |
| 93 | Aluno 093 | `aluno093@gaesde.com` | `Aluno@123456` | 3 |
| 94 | Aluno 094 | `aluno094@gaesde.com` | `Aluno@123456` | 2 |
| 95 | Aluno 095 | `aluno095@gaesde.com` | `Aluno@123456` | 2 |
| 96 | Aluno 096 | `aluno096@gaesde.com` | `Aluno@123456` | 3 |
| 97 | Aluno 097 | `aluno097@gaesde.com` | `Aluno@123456` | 2 |
| 98 | Aluno 098 | `aluno098@gaesde.com` | `Aluno@123456` | 2 |
| 99 | Aluno 099 | `aluno099@gaesde.com` | `Aluno@123456` | 3 |
| 100 | Aluno 100 | `aluno100@gaesde.com` | `Aluno@123456` | 2 |

</details>

---

## 🎟️ Distribuição de matrículas por curso

| Curso | Matrículas |
| --- | ---: |
| Logica de Programacao | 33 |
| Desenvolvimento Web com JavaScript | 50 |
| Biologia Celular | 33 |
| Genetica e Evolucao | 34 |
| Historia do Brasil | 50 |
| Historia Antiga e Medieval | 33 |

**Total de matrículas:** 233 (média de 2.33 cursos por aluno; mínimo garantido de 2 por aluno).

---

## 🔗 Como acessar

- **Login:** `POST /users/login` com `{ "email": "...", "password": "..." }`
- **Documentação Swagger:** `https://gaesdeapi.netlify.app/api/docs`
- **Front-end (web):** aponta para `https://gaesdeapi.netlify.app`.

