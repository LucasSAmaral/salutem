import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const clinic = await prisma.clinic.upsert({
    where: { slug: "clinica-dr-joao" },
    update: {},
    create: {
      name: "Clínica Dr. João",
      slug: "clinica-dr-joao",
    },
  });

  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@salutem.dev" },
    update: {},
    create: {
      name: "Admin Salutem",
      email: "admin@salutem.dev",
      password: adminPasswordHash,
      role: Role.ADMIN,
      clinicId: clinic.id,
    },
  });

  const doctorPasswordHash = await bcrypt.hash("medico123", 10);

  const doctorUser = await prisma.user.upsert({
    where: { email: "medico@salutem.dev" },
    update: {},
    create: {
      name: "Dra. Ana Souza",
      email: "medico@salutem.dev",
      password: doctorPasswordHash,
      role: Role.DOCTOR,
      clinicId: clinic.id,
    },
  });

  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      clinicId: clinic.id,
      crm: "12345-SP",
      specialty: "Clínica Geral",
    },
  });

  const attendantPasswordHash = await bcrypt.hash("atendente123", 10);

  await prisma.user.upsert({
    where: { email: "atendente@salutem.dev" },
    update: {},
    create: {
      name: "Bia Ramos",
      email: "atendente@salutem.dev",
      password: attendantPasswordHash,
      role: Role.ATTENDANT,
      clinicId: clinic.id,
    },
  });

  const doctor2PasswordHash = await bcrypt.hash("medico123", 10);

  const doctor2User = await prisma.user.upsert({
    where: { email: "medico2@salutem.dev" },
    update: {},
    create: {
      name: "Dr. Carlos Lima",
      email: "medico2@salutem.dev",
      password: doctor2PasswordHash,
      role: Role.DOCTOR,
      clinicId: clinic.id,
    },
  });

  const doctor2 = await prisma.doctor.upsert({
    where: { userId: doctor2User.id },
    update: {},
    create: {
      userId: doctor2User.id,
      clinicId: clinic.id,
      crm: "54321-SP",
      specialty: "Cardiologia",
    },
  });

  // Turnos de exemplo, pra ter horários disponíveis pra testar o Agendamento sem
  // precisar cadastrar manualmente pela tela de Agenda antes. DoctorSchedule não
  // tem chave única natural, então usamos count() pra manter o seed idempotente.
  const existingSchedules = await prisma.doctorSchedule.count({ where: { doctorId: doctor.id } });
  if (existingSchedules === 0) {
    await prisma.doctorSchedule.createMany({
      data: [1, 2, 3, 4, 5].map((dayOfWeek) => ({
        doctorId: doctor.id,
        dayOfWeek,
        startTime: "08:00",
        endTime: "12:00",
        breakStart: "10:00",
        breakEnd: "10:15",
      })),
    });
  }

  const existingSchedules2 = await prisma.doctorSchedule.count({ where: { doctorId: doctor2.id } });
  if (existingSchedules2 === 0) {
    await prisma.doctorSchedule.createMany({
      data: [1, 3, 5].map((dayOfWeek) => ({
        doctorId: doctor2.id,
        dayOfWeek,
        startTime: "09:00",
        endTime: "17:00",
        breakStart: "12:00",
        breakEnd: "13:00",
      })),
    });
  }

  console.log("Seed concluído: admin@salutem.dev / admin123");
  console.log("Seed concluído: medico@salutem.dev / medico123");
  console.log("Seed concluído: medico2@salutem.dev / medico123");
  console.log("Seed concluído: atendente@salutem.dev / atendente123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
