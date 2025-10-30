// file test db

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("123456", 10);

  const users = [
    {
      email: "admin@example.com",
      username: "admin_user",
      passwordHash: password,
      role: "admin",
    },
    {
      email: "student@example.com",
      username: "student_user",
      passwordHash: password,
      role: "student",
    },
    {
      email: "instructor@example.com",
      username: "instructor_user",
      passwordHash: password,
      role: "instructor",
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
