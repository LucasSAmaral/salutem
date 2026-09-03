# Salutem — Sistema de Gestão para Clínicas Médicas

## Visão Geral

SaaS multi-tenant para clínicas médicas particulares. Cada clínica tem sua própria base de dados PostgreSQL isolada. O frontend é compartilhado entre todos os tenants.

## Stack

- **Framework:** Next.js 16 + TypeScript (App Router)
- **UI:** Material UI (MUI) v9
- **ORM:** Prisma v5.22.0
- **Banco:** PostgreSQL (um banco por clínica)
- **Autenticação:** NextAuth.js com JWT
- **Tempo real:** Supabase Realtime ou Pusher (fila e agendamento)
- **Storage:** AWS S3 (exames e arquivos)
- **Infra:** Docker + AWS (ECS, RDS, S3, Route 53)

## Perfis de Usuário

- **ADMIN:** secretária/gestão da clínica — gerencia a agenda dos médicos (turnos, horário de funcionamento) e pagamento/cobrança. **Não acessa prontuário do paciente** — histórico clínico é exclusivo do DOCTOR.
- **DOCTOR:** acessa prontuários, visualiza e gerencia fila em tempo real, configura própria agenda (ADMIN também pode configurar em nome dele)
- **ATTENDANT:** agenda consultas, confirma chegada de pacientes, gerencia fila
- **PATIENT:** realiza autoagendamento online

## Funcionalidades Principais

### Agendamento

- Calendário de disponibilidade gerado automaticamente com base na agenda do médico
- Agendamento instantâneo sem aprovação manual
- Atualização em tempo real (sem race condition)
- Atendente usa a mesma tela de agendamento do paciente
- Suporte a encaixe (slot fora da agenda normal)

### Fila de Atendimento

- Atendente confirma chegada e adiciona paciente à fila
- Médico visualiza fila atualizada em tempo real
- Status: AGUARDANDO → EM_ATENDIMENTO → ATENDIDO
- Indicador visual de último paciente do dia (último agendado e último presente podem ser diferentes)
- Encaixes sinalizados visualmente na fila

### Prontuário

- Histórico de consultas por paciente
- Upload e visualização de exames (PDF e imagens via S3)
- Busca por nome, CPF ou data de nascimento
- Consentimento LGPD registrado no cadastro

### Agenda do Médico

- Configuração de dias e turnos de atendimento
- Duração de consulta configurável (padrão 30min)
- Intervalos programados (almoço, pausas)
- Bloqueio de horários avulsos
- Registro de férias e ausências
- Respeita horário de funcionamento da clínica

## Estrutura do Banco (Prisma)

Modelos: Clinic, User, Doctor, DoctorSchedule, DoctorAbsence, Patient, Appointment, QueueItem, Exam
Enums: Role (ADMIN, DOCTOR, ATTENDANT), AppointmentStatus (SCHEDULED, CONFIRMED, IN_PROGRESS, DONE, CANCELLED)

## Multi-tenancy

- Roteamento por clínica via slug (ex: clinica-dr-joao)
- **Modelo atual: banco PostgreSQL único e compartilhado**, com `clinicId` em toda tabela pra isolar os dados por clínica. Escolhido pelo custo fixo baixo (não escala com número de clínicas), ideal pra validar o produto antes de gerar receita.
- **Regra obrigatória de código**: toda query que acessa dado de clínica (Patient, Appointment, Doctor, etc.) DEVE filtrar por `clinicId`. Esquecer isso é um vazamento de dado entre clínicas, não só uma falha de isolamento — crítico dado que envolve prontuário médico (LGPD).
- **Caminho de evolução futuro**: se o produto gerar receita que justifique, migrar para banco isolado por clínica é viável sem redesenhar o schema — como todo dado já é particionado por `clinicId`, a migração é um export por clínica (`WHERE clinicId = X`) para um banco novo, feito sob demanda, clínica a clínica. Não é uma decisão que precisa ser tomada agora.

## Conformidade LGPD

- Consentimento do paciente registrado no cadastro
- Log de acesso a prontuários
- Criptografia em repouso (RDS + S3 com SSE)

## Convenções de Código

- Sempre usar TypeScript estrito
- Componentes em PascalCase
- Funções e variáveis em camelCase
- Arquivos de página: page.tsx
- Arquivos de componente: NomeComponente.tsx
- Sempre tipar retornos de funções assíncronas
- Usar Server Components por padrão, Client Components apenas quando necessário (interatividade, hooks)
- Rotas de API em app/api/

## Como Rodar Localmente

1. `docker compose up -d` — sobe o PostgreSQL
2. `npx prisma migrate dev` — roda as migrations
3. `npm run dev` — inicia o servidor em http://localhost:3000
