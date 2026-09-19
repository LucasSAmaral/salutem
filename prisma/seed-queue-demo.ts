/**
 * Cenário de teste manual da fila de atendimento: cria (ou reaproveita) 4
 * pacientes de teste e marca uma consulta de HOJE pra cada um, todas ainda sem
 * chegada confirmada. Pode rodar quantas vezes quiser: cada execução apaga as
 * consultas de hoje desses pacientes (e as entradas de fila delas) e recria,
 * então serve também pra recomeçar o teste do zero.
 *
 *   npx tsx --env-file=.env prisma/seed-queue-demo.ts
 *
 * Só mexe nos pacientes listados abaixo, identificados pelo CPF.
 */
import { PrismaClient } from "@prisma/client";
import { combineDateAndTime } from "@/lib/availability";
import { dayRange, todayInClinic } from "@/lib/clinicTime";

const prisma = new PrismaClient({ log: [] });

const CLINIC_SLUG = "clinica-dr-joao";

const DEMO_APPOINTMENTS = [
  { name: "Marina Teste", cpf: "529.982.247-25", birthDate: "1988-03-14", doctorEmail: "medico@salutem.dev", time: "09:00", isWalkIn: false },
  { name: "Roberto Teste", cpf: "111.444.777-35", birthDate: "1975-11-02", doctorEmail: "medico@salutem.dev", time: "09:30", isWalkIn: false },
  { name: "Camila Teste", cpf: "123.456.789-09", birthDate: "1995-07-21", doctorEmail: "medico@salutem.dev", time: "10:00", isWalkIn: true },
  { name: "Paulo Teste", cpf: "987.654.321-00", birthDate: "1969-01-30", doctorEmail: "medico2@salutem.dev", time: "09:00", isWalkIn: false },
] as const;

async function main(): Promise<void> {
  const today = todayInClinic();
  const { start, end } = dayRange(today);
  const clinic = await prisma.clinic.findUniqueOrThrow({ where: { slug: CLINIC_SLUG } });

  const patients = await Promise.all(
    DEMO_APPOINTMENTS.map((demo) => {
      const data = {
        name: demo.name,
        birthDate: new Date(`${demo.birthDate}T00:00:00.000Z`),
        consent: true,
      };
      return prisma.patient.upsert({
        where: { cpf_clinicId: { cpf: demo.cpf, clinicId: clinic.id } },
        update: data,
        create: { ...data, cpf: demo.cpf, clinicId: clinic.id },
      });
    })
  );

  const doctors = await Promise.all(
    [...new Set(DEMO_APPOINTMENTS.map((demo) => demo.doctorEmail))].map((email) =>
      prisma.doctor.findFirstOrThrow({ where: { clinicId: clinic.id, user: { email } }, include: { user: true } })
    )
  );
  const doctorByEmail = new Map(doctors.map((doctor) => [doctor.user.email, doctor]));

  const todayOfDemoPatients = {
    clinicId: clinic.id,
    patientId: { in: patients.map((patient) => patient.id) },
    date: { gte: start, lte: end },
  };
  const stale = await prisma.appointment.findMany({ where: todayOfDemoPatients, select: { id: true } });
  await prisma.queueItem.deleteMany({ where: { appointmentId: { in: stale.map((a) => a.id) } } });
  await prisma.appointment.deleteMany({ where: { id: { in: stale.map((a) => a.id) } } });

  await Promise.all(
    DEMO_APPOINTMENTS.map((demo, index) =>
      prisma.appointment.create({
        data: {
          clinicId: clinic.id,
          patientId: patients[index].id,
          doctorId: doctorByEmail.get(demo.doctorEmail)!.id,
          date: combineDateAndTime(today, demo.time),
          isWalkIn: demo.isWalkIn,
        },
      })
    )
  );

  console.log(`Cenário criado pra hoje (${today}) na ${clinic.name}:`);
  DEMO_APPOINTMENTS.forEach((demo) =>
    console.log(
      `  ${demo.time}  ${demo.name.padEnd(14)} ${doctorByEmail.get(demo.doctorEmail)!.user.name.padEnd(16)} ${demo.isWalkIn ? "encaixe" : "agendado"}`
    )
  );
  console.log(`(${stale.length} consulta(s) de teste anteriores de hoje foram removidas antes)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
