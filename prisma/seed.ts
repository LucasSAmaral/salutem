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

  await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      clinicId: clinic.id,
      crm: "12345-SP",
      specialty: "Clínica Geral",
    },
  });

  console.log("Seed concluído: admin@salutem.dev / admin123");
  console.log("Seed concluído: medico@salutem.dev / medico123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
