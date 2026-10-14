import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

async function main() {
  const name = "admin";
  const password = "zakaranda";

  const existing = await prisma.user.findFirst({ where: { name } });
  if (existing) {
    console.log("User 'admin' efa misy — tsy noforonina indray.");
    return;
  }

  const hashed = await hashPassword(password);
  const user = await prisma.user.create({
    data: { name, password: hashed },
  });
  console.log("User par défaut noforonina:", user.name, "(id:", user.id + ")");
  console.log("  name: admin");
  console.log("  password: zakaranda");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
