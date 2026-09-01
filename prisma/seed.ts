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

  const passwordHash = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@salutem.dev" },
    update: {},
    create: {
      name: "Admin Salutem",
      email: "admin@salutem.dev",
      password: passwordHash,
      role: Role.ADMIN,
      clinicId: clinic.id,
    },
  });

  console.log("Seed concluído: admin@salutem.dev / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
