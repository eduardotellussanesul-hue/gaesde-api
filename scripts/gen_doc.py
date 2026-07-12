#!/usr/bin/env python3
"""Gera SEED_CREDENCIAIS.md a partir de scripts/seed-data.json."""
import json
from collections import Counter
from datetime import datetime

with open("scripts/seed-data.json", encoding="utf-8") as f:
    d = json.load(f)

profs = d["professors"]
courses = d["courses"]
students = d["students"]
enrollments = d["enrollments"]

id_to_course = {c["id"]: c for c in courses}
course_counts = Counter(e["course"] for e in enrollments)

lines = []
w = lines.append

w("# 🌱 GAESDE — Documento de Seed de Dados e Credenciais")
w("")
w(f"> Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M')}")
w("")
w("Este documento registra **todos os dados criados** no processo de povoamento (seed) "
  "da plataforma GAESDE, incluindo **usuários, senhas, cursos, módulos e matrículas**. "
  "Todo o cadastro foi feito via **API REST** (endpoints/URLs).")
w("")
w("⚠️ **Aviso de segurança:** as senhas abaixo são padrão de ambiente de teste. "
  "Em produção, altere-as e nunca versione este arquivo em repositório público.")
w("")
w("---")
w("")

# Resumo
w("## 📊 Resumo")
w("")
w("| Item | Quantidade |")
w("| --- | ---: |")
w(f"| Administrador | 1 |")
w(f"| Professores (instructor) | {len(profs)} |")
w(f"| Cursos | {len(courses)} |")
w(f"| Módulos | {len(courses) * 3} |")
w(f"| Conteúdos (vídeo + texto + quiz) | {len(courses) * 9} |")
w(f"| Quizzes | {len(courses) * 3} |")
w(f"| Alunos (student) | {len(students)} |")
w(f"| Matrículas | {len(enrollments)} |")
w("")
w("---")
w("")

# Passos
w("## 🧭 Passos executados (fluxo de registro via API)")
w("")
w("Base da API (local durante o seed): `http://localhost:3000` — "
  "Produção: `https://gaesdeapi.netlify.app`")
w("")
w("1. **Limpeza do banco** (`test`) mantendo apenas o administrador, os *roles* "
  "(`admin`, `instructor`, `student`) e o vínculo de role do admin.")
w("2. **Login do admin** em `POST /users/login` para obter o token JWT.")
w("3. **Leitura dos roles** em `GET /roles`.")
w("4. Para cada **professor**:")
w("   - `POST /users/register` (multipart) para criar o usuário.")
w("   - `POST /user-roles/assign` para atribuir o role **instructor**.")
w("   - Login do professor e `POST /courses` para criar **2 cursos** (o `instructorId` "
  "vem do token do professor).")
w("5. Para cada **curso** (via token admin): `POST /modules` (3 módulos) e, em cada módulo, "
  "`POST /contents` para **vídeo**, **texto** e **quiz**:")
w("   - Vídeo: `POST /contents/{id}/video`")
w("   - Texto: `POST /contents/{id}/text`")
w("   - Quiz: `POST /quizzes` + `POST /questions` (3 questões) + `POST /question-options`.")
w("6. **100 alunos**: `POST /users/register` + `POST /user-roles/assign` (role **student**).")
w("7. **Matrículas**: `POST /enrollments/assign` garantindo que **cada aluno fique em "
  "pelo menos 2 cursos** (parte deles em 3).")
w("")
w("---")
w("")

# Admin
w("## 👑 Administrador Master")
w("")
w("| Nome | Email | Senha |")
w("| --- | --- | --- |")
w("| Administrador Master | `admin@gaesde.com` | `Admin@123456` |")
w("")
w("---")
w("")

# Professores
w("## 👨‍🏫 Professores")
w("")
w("Senha padrão dos professores: **`Prof@123456`**")
w("")
w("| Área | Nome | Email | Senha | Cursos |")
w("| --- | --- | --- | --- | --- |")
for p in profs:
    pcourses = [c["title"] for c in courses if c["instructor"] == p["email"]]
    w(f"| {p['area']} | {p['name']} | `{p['email']}` | `{p['password']}` | "
      f"{'; '.join(pcourses)} |")
w("")
w("---")
w("")

# Cursos e modulos
w("## 📚 Cursos, Módulos e Conteúdos")
w("")
w("Cada curso possui **3 módulos**, e cada módulo contém **1 vídeo**, **1 texto explicativo** "
  "e **1 questionário (quiz)** com 3 questões.")
w("")
for c in courses:
    w(f"### {c['title']}")
    w("")
    w(f"- **Área:** {c['area']}")
    w(f"- **Professor:** `{c['instructor']}`")
    w(f"- **Slug:** `{c['slug']}`")
    w(f"- **Alunos matriculados:** {course_counts.get(c['id'], 0)}")
    w("- **Módulos:**")
    for m in c["modules"]:
        w(f"  - {m['title']} — conteúdos: vídeo, texto, quiz (3 questões)")
    w("")
w("---")
w("")

# Alunos
w("## 👨‍🎓 Alunos")
w("")
w(f"Total: **{len(students)} alunos**. Senha padrão de todos: **`Aluno@123456`**")
w("")
w("Emails no padrão `aluno001@gaesde.com` … `aluno100@gaesde.com`.")
w("")
w("<details><summary>📋 Lista completa dos 100 alunos (clique para expandir)</summary>")
w("")
w("| # | Nome | Email | Senha | Cursos matriculados |")
w("| ---: | --- | --- | --- | ---: |")
for idx, s in enumerate(students, start=1):
    ncourses = len(s["courses"])
    w(f"| {idx} | {s['name']} | `{s['email']}` | `{s['password']}` | {ncourses} |")
w("")
w("</details>")
w("")
w("---")
w("")

# Matriculas por curso
w("## 🎟️ Distribuição de matrículas por curso")
w("")
w("| Curso | Matrículas |")
w("| --- | ---: |")
for c in courses:
    w(f"| {c['title']} | {course_counts.get(c['id'], 0)} |")
w("")
w(f"**Total de matrículas:** {len(enrollments)} "
  f"(média de {len(enrollments) / max(len(students), 1):.2f} cursos por aluno; "
  f"mínimo garantido de 2 por aluno).")
w("")
w("---")
w("")
w("## 🔗 Como acessar")
w("")
w("- **Login:** `POST /users/login` com `{ \"email\": \"...\", \"password\": \"...\" }`")
w("- **Documentação Swagger:** `https://gaesdeapi.netlify.app/api/docs`")
w("- **Front-end (web):** aponta para `https://gaesdeapi.netlify.app`.")
w("")

with open("SEED_CREDENCIAIS.md", "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

print("SEED_CREDENCIAIS.md gerado com", len(lines), "linhas.")
