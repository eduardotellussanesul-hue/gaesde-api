#!/usr/bin/env python3
"""
Seed de dados do GAESDE via API (URLs).

Cria:
- 3 professores (programacao, biologia, historia) com role instructor
- 2 cursos por professor (6 cursos) publicados
- 3 modulos por curso, cada modulo com: video + texto explicativo + quiz (com questoes)
- 100 alunos com role student
- matriculas de forma que cada aluno esteja em pelo menos 2 cursos

Gera:
- scripts/seed-data.json  (dados brutos: ids, emails, senhas)
- SEED_CREDENCIAIS.md      (documento legivel com todas as credenciais e passos)
"""
import json
import sys
import time
import unicodedata
import requests

BASE_URL = "http://localhost:3000"
ADMIN_EMAIL = "admin@gaesde.com"
ADMIN_PASSWORD = "Admin@123456"
PROF_PASSWORD = "Prof@123456"
STUDENT_PASSWORD = "Aluno@123456"

session = requests.Session()
session.headers.update({"Accept": "application/json"})


def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    out = []
    for ch in text:
        if ch.isalnum():
            out.append(ch)
        elif ch in " -_":
            out.append("-")
    slug = "".join(out)
    while "--" in slug:
        slug = slug.replace("--", "-")
    return slug.strip("-")


def die(msg, resp=None):
    print(f"\n[ERRO] {msg}")
    if resp is not None:
        print("status:", resp.status_code)
        print("body:", resp.text[:600])
    sys.exit(1)


def login(email, password):
    r = session.post(f"{BASE_URL}/users/login", json={"email": email, "password": password}, timeout=30)
    if r.status_code >= 400:
        die(f"login falhou para {email}", r)
    data = r.json()
    token = data.get("access_token") or data.get("accessToken")
    user = data.get("user") or {}
    uid = user.get("id") or user.get("_id")
    if not token:
        die(f"login sem token para {email}", r)
    return token, uid


def auth(token):
    return {"Authorization": f"Bearer {token}"}


def register_user(admin_token, name, email, password, bio=""):
    # multipart/form-data para casar com FileInterceptor('file')
    files = {
        "name": (None, name),
        "email": (None, email),
        "password": (None, password),
        "bio": (None, bio),
    }
    r = session.post(f"{BASE_URL}/users/register", headers=auth(admin_token), files=files, timeout=30)
    if r.status_code >= 400:
        die(f"registro falhou para {email}", r)
    data = r.json()
    return data.get("id") or data.get("_id")


def assign_role(admin_token, user_id, role_id):
    r = session.post(f"{BASE_URL}/user-roles/assign", headers=auth(admin_token),
                     json={"userId": user_id, "roleId": role_id}, timeout=30)
    if r.status_code >= 400 and "already" not in r.text.lower():
        die(f"assign role falhou user={user_id}", r)


def create_course(prof_token, payload):
    r = session.post(f"{BASE_URL}/courses", headers=auth(prof_token), json=payload, timeout=30)
    if r.status_code >= 400:
        die(f"criar curso falhou: {payload.get('slug')}", r)
    data = r.json()
    return data.get("id") or data.get("_id")


def publish_course(token, course_id):
    r = session.post(f"{BASE_URL}/courses/{course_id}/publish", headers=auth(token), timeout=30)
    # ignora se ja publicado
    return r.status_code < 400


def create_module(token, course_id, title, description, order):
    r = session.post(f"{BASE_URL}/modules", headers=auth(token),
                     json={"courseId": course_id, "title": title, "description": description, "orderIndex": order},
                     timeout=30)
    if r.status_code >= 400:
        die(f"criar modulo falhou: {title}", r)
    data = r.json()
    return data.get("id") or data.get("_id")


def create_content(token, module_id, title, ctype, order, duration=None):
    body = {"moduleId": module_id, "title": title, "type": ctype, "orderIndex": order, "isFreePreview": order == 0}
    if duration is not None:
        body["durationSeconds"] = duration
    r = session.post(f"{BASE_URL}/contents", headers=auth(token), json=body, timeout=30)
    if r.status_code >= 400:
        die(f"criar content falhou: {title}", r)
    data = r.json()
    return data.get("id") or data.get("_id")


def add_video(token, content_id, url, duration):
    r = session.post(f"{BASE_URL}/contents/{content_id}/video", headers=auth(token),
                     json={"videoUrl": url, "videoDurationSeconds": duration}, timeout=30)
    if r.status_code >= 400:
        die("add video falhou", r)


def add_text(token, content_id, body_text):
    r = session.post(f"{BASE_URL}/contents/{content_id}/text", headers=auth(token),
                     json={"body": body_text}, timeout=30)
    if r.status_code >= 400:
        die("add text falhou", r)


def create_quiz(token, content_id):
    r = session.post(f"{BASE_URL}/quizzes", headers=auth(token),
                     json={"contentId": content_id, "timeLimitMinutes": 15,
                           "passingScorePercentage": 60, "attemptsAllowed": 3, "shuffleQuestions": False},
                     timeout=30)
    if r.status_code >= 400:
        die("criar quiz falhou", r)
    data = r.json()
    return data.get("id") or data.get("_id")


def create_question(token, quiz_id, qtype, text, points, order):
    r = session.post(f"{BASE_URL}/questions", headers=auth(token),
                     json={"quizId": quiz_id, "type": qtype, "questionText": text,
                           "points": points, "orderIndex": order}, timeout=30)
    if r.status_code >= 400:
        die("criar questao falhou", r)
    data = r.json()
    return data.get("id") or data.get("_id")


def create_option(token, question_id, text, correct):
    r = session.post(f"{BASE_URL}/question-options", headers=auth(token),
                     json={"questionId": question_id, "optionText": text, "isCorrect": correct}, timeout=30)
    if r.status_code >= 400:
        die("criar opcao falhou", r)


def enroll(admin_token, user_id, course_id):
    r = session.post(f"{BASE_URL}/enrollments/assign", headers=auth(admin_token),
                     json={"userId": user_id, "courseId": course_id}, timeout=30)
    if r.status_code >= 400 and "already" not in r.text.lower() and "ja" not in r.text.lower():
        die(f"matricula falhou user={user_id} course={course_id}", r)
    return r.status_code < 400


# ------------------------------------------------------------------
# Definicao dos dados
# ------------------------------------------------------------------
PROFESSORS = [
    {"name": "Prof. Carlos Programador", "email": "prof.programacao@gaesde.com",
     "area": "Programacao", "bio": "Professor de Programacao e Desenvolvimento de Software.",
     "courses": [
         {"title": "Logica de Programacao", "level": "beginner",
          "desc": "Fundamentos de logica, algoritmos e resolucao de problemas."},
         {"title": "Desenvolvimento Web com JavaScript", "level": "intermediate",
          "desc": "HTML, CSS, JavaScript e construcao de aplicacoes web modernas."},
     ]},
    {"name": "Profa. Beatriz Bio", "email": "prof.biologia@gaesde.com",
     "area": "Biologia", "bio": "Professora de Biologia, Genetica e Ciencias Naturais.",
     "courses": [
         {"title": "Biologia Celular", "level": "beginner",
          "desc": "Estrutura e funcionamento das celulas, organelas e metabolismo."},
         {"title": "Genetica e Evolucao", "level": "intermediate",
          "desc": "Hereditariedade, DNA, mutacoes e teorias evolutivas."},
     ]},
    {"name": "Prof. Henrique Historia", "email": "prof.historia@gaesde.com",
     "area": "Historia", "bio": "Professor de Historia do Brasil e Historia Geral.",
     "courses": [
         {"title": "Historia do Brasil", "level": "beginner",
          "desc": "Do periodo colonial a republica: fatos, processos e personagens."},
         {"title": "Historia Antiga e Medieval", "level": "intermediate",
          "desc": "Civilizacoes antigas, imperios e a Idade Media."},
     ]},
]

MODULE_TEMPLATES = [
    ("Modulo 1 - Introducao", "Apresentacao dos conceitos iniciais e objetivos do modulo."),
    ("Modulo 2 - Conceitos Fundamentais", "Aprofundamento nos principais conceitos do tema."),
    ("Modulo 3 - Aplicacoes Praticas", "Exercicios, estudos de caso e aplicacoes reais."),
]

VIDEO_URL = "https://www.youtube.com/watch?v=8mAITcNt710"


def build_text(area, course_title, module_title):
    return (
        f"# {module_title}\n\n"
        f"Bem-vindo ao curso de {course_title} na area de {area}.\n\n"
        f"Neste modulo voce vai estudar os conceitos essenciais de forma pratica. "
        f"Leia o material com atencao, assista ao video e resolva o questionario ao final "
        f"para fixar o conteudo.\n\n"
        f"## Objetivos de aprendizagem\n"
        f"- Compreender os fundamentos abordados no modulo.\n"
        f"- Relacionar a teoria com exemplos praticos.\n"
        f"- Avaliar seu progresso por meio do questionario.\n"
    )


def build_questions(area, module_index):
    """Retorna lista de questoes: (tipo, enunciado, [(opcao, correta), ...])."""
    return [
        ("multiple_choice",
         f"Sobre o conteudo do {MODULE_TEMPLATES[module_index][0]} de {area}, qual afirmacao esta correta?",
         [("A afirmacao que representa corretamente o conceito estudado.", True),
          ("Uma afirmacao incorreta e sem relacao com o tema.", False),
          ("Uma afirmacao parcialmente correta, mas incompleta.", False),
          ("Nenhuma das alternativas anteriores.", False)]),
        ("multiple_choice",
         f"Qual e o principal objetivo deste modulo de {area}?",
         [("Compreender e aplicar os conceitos fundamentais do tema.", True),
          ("Decorar datas sem entender o contexto.", False),
          ("Ignorar a pratica e focar apenas na teoria.", False),
          ("Concluir sem realizar as atividades.", False)]),
        ("true_false",
         f"O questionario deste modulo ajuda a fixar o conteudo estudado em {area}.",
         [("Verdadeiro", True), ("Falso", False)]),
    ]


def main():
    result = {"professors": [], "courses": [], "students": [], "enrollments": []}

    print(">> Login admin...")
    admin_token, admin_id = login(ADMIN_EMAIL, ADMIN_PASSWORD)
    print("   admin id:", admin_id)

    print(">> Buscando roles...")
    r = session.get(f"{BASE_URL}/roles", headers=auth(admin_token), timeout=30)
    if r.status_code >= 400:
        die("listar roles falhou", r)
    roles = {role["slug"]: (role.get("id") or role.get("_id")) for role in r.json()}
    print("   roles:", roles)
    instructor_role = roles["instructor"]
    student_role = roles["student"]

    # ---- Professores + cursos ----
    for prof in PROFESSORS:
        print(f"\n>> Criando professor: {prof['email']}")
        pid = register_user(admin_token, prof["name"], prof["email"], PROF_PASSWORD, prof["bio"])
        assign_role(admin_token, pid, instructor_role)
        prof_token, _ = login(prof["email"], PROF_PASSWORD)
        result["professors"].append({"id": pid, "name": prof["name"], "email": prof["email"],
                                      "password": PROF_PASSWORD, "area": prof["area"]})

        for course in prof["courses"]:
            slug = slugify(course["title"])
            print(f"   - curso: {course['title']} ({slug})")
            cid = create_course(prof_token, {
                "title": course["title"], "slug": slug, "description": course["desc"],
                "price": 0, "status": "published", "level": course["level"],
            })
            publish_course(prof_token, cid)
            course_rec = {"id": cid, "title": course["title"], "slug": slug,
                          "instructor": prof["email"], "area": prof["area"], "modules": []}

            for m_idx, (m_title, m_desc) in enumerate(MODULE_TEMPLATES):
                mid = create_module(admin_token, cid, m_title, m_desc, m_idx)
                # video
                vc = create_content(admin_token, mid, f"Video - {m_title}", "video", 0, duration=600)
                add_video(admin_token, vc, VIDEO_URL, 600)
                # texto
                tc = create_content(admin_token, mid, f"Texto explicativo - {m_title}", "text", 1)
                add_text(admin_token, tc, build_text(prof["area"], course["title"], m_title))
                # quiz
                qc = create_content(admin_token, mid, f"Questionario - {m_title}", "quiz", 2)
                quiz_id = create_quiz(admin_token, qc)
                for q_idx, (qtype, qtext, options) in enumerate(build_questions(prof["area"], m_idx)):
                    qid = create_question(admin_token, quiz_id, qtype, qtext, 10, q_idx)
                    for opt_text, correct in options:
                        create_option(admin_token, qid, opt_text, correct)
                course_rec["modules"].append({"id": mid, "title": m_title,
                                              "contents": ["video", "text", "quiz"]})
                print(f"       modulo ok: {m_title} (video+texto+quiz 3 questoes)")

            result["courses"].append(course_rec)

    course_ids = [c["id"] for c in result["courses"]]
    n_courses = len(course_ids)
    print(f"\n>> {n_courses} cursos criados. Registrando 100 alunos...")

    # ---- 100 alunos ----
    for i in range(1, 101):
        num = f"{i:03d}"
        email = f"aluno{num}@gaesde.com"
        name = f"Aluno {num}"
        sid = register_user(admin_token, name, email, STUDENT_PASSWORD, "Aluno da plataforma GAESDE.")
        assign_role(admin_token, sid, student_role)

        # matricula em pelo menos 2 cursos (alguns em 3)
        c1 = course_ids[i % n_courses]
        c2 = course_ids[(i + 2) % n_courses]
        chosen = [c1, c2]
        if i % 3 == 0:
            chosen.append(course_ids[(i + 4) % n_courses])
        chosen = list(dict.fromkeys(chosen))  # dedupe mantendo ordem
        for cid in chosen:
            enroll(admin_token, sid, cid)
            result["enrollments"].append({"student": email, "course": cid})

        result["students"].append({"id": sid, "name": name, "email": email,
                                    "password": STUDENT_PASSWORD, "courses": chosen})
        if i % 10 == 0:
            print(f"   {i}/100 alunos registrados e matriculados...")

    with open("scripts/seed-data.json", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print("\n>> Seed concluido.")
    print(f"   professores: {len(result['professors'])}")
    print(f"   cursos:      {len(result['courses'])}")
    print(f"   alunos:      {len(result['students'])}")
    print(f"   matriculas:  {len(result['enrollments'])}")
    print("   dados salvos em scripts/seed-data.json")


if __name__ == "__main__":
    t0 = time.time()
    main()
    print(f"tempo total: {time.time() - t0:.1f}s")
