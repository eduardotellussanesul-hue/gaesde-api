import { INestApplication, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

function configureApplication(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('GAESDE API - Gestao de Cursos Online')
    .setDescription(`
      ## API completa para plataforma de cursos online

      ### Funcionalidades implementadas:

      **1. Autenticacao e Usuarios**
      - Registro e login de usuarios
      - JWT Token para autenticacao
      - Roles: Admin, Instructor, Student

      **2. Catalogo de Cursos**
      - Categorias (hierarquicas)
      - Cursos (com status: draft, review, published, archived)
      - Modulos (ordenaveis)
      - Conteudos (video, text, pdf, quiz, assignment)

      **3. Jornada do Aluno**
      - Matriculas em cursos
      - Progresso automatico
      - Completions de conteudos
      - Certificados (geracao em PDF/HTML)

      **4. Avaliacoes**
      - Quizzes com questoes (multiple_choice, true_false, essay)
      - Tentativas e submissoes
      - Reviews (1-5 estrelas)

      **5. Recursos Adicionais**
      - Upload de arquivos (Cloudinary)
      - Assignment Submissions
      - Verificacao de certificados

      ### Autenticacao:
      Use o botao **Authorize** acima para informar o token JWT.
      Token padrao: \`Bearer {seu_token}\`
    `)
    .setVersion('1.0.0')
    .setContact('GAESDE Team', 'https://github.com/gaesde', 'suporte@gaesde.com')
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Informe o token JWT para autenticacao',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('auth', 'Autenticacao e gerenciamento de usuarios')
    .addTag('users', 'Gerenciamento de usuarios')
    .addTag('roles', 'Gerenciamento de papeis e permissoes')
    .addTag('categories', 'Gerenciamento de categorias')
    .addTag('courses', 'Gerenciamento de cursos')
    .addTag('modules', 'Gerenciamento de modulos')
    .addTag('contents', 'Gerenciamento de conteudos')
    .addTag('enrollments', 'Matriculas e progresso')
    .addTag('completions', 'Conclusao de conteudos')
    .addTag('quizzes', 'Gerenciamento de quizzes')
    .addTag('questions', 'Gerenciamento de questoes')
    .addTag('question-options', 'Gerenciamento de opcoes')
    .addTag('quiz-attempts', 'Tentativas de quizzes')
    .addTag('user-answers', 'Respostas dos usuarios')
    .addTag('reviews', 'Avaliacoes de cursos')
    .addTag('certificates', 'Certificados de conclusao')
    .addTag('assignment-submissions', 'Submissoes de assignments')
    .addTag('health', 'Health check da aplicacao')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document, {
    explorer: true,
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #4A90D9 }
      .swagger-ui .info .title small { font-size: 12px }
    `,
    customSiteTitle: 'GAESDE API - Documentacao',
    swaggerOptions: {
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}

export async function createApp(adapter?: ExpressAdapter) {
  const app = adapter
    ? await NestFactory.create(AppModule, adapter)
    : await NestFactory.create(AppModule);

  configureApplication(app);

  return app;
}