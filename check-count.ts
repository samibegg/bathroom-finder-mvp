import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
  const count = await prisma.bathroom.count();
  console.log(`Total bathrooms in DB: ${count}`);
}
main().finally(() => prisma.$disconnect());
