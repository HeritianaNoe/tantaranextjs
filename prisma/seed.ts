import { PrismaClient } from "@prisma/client";
import { randomBytes, scrypt } from "crypto";
import { promisify } from "util";

const prisma = new PrismaClient();

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

const DEFAULT_CATEGORIES = [
  { name: "Angano", slug: "angano", description: "Angano sy tantara nentim-paharazana." },
  { name: "Tantara foronina", slug: "tantara-foronina", description: "Tantara noforonin'ny mpanoratra." },
  { name: "Tantara tena izy", slug: "tantara-tena-izy", description: "Tantara niainana na zava-nisy marina." },
  { name: "Tantaram-pitiavana", slug: "tantaram-pitiavana", description: "Tantara momba ny fitiavana." },
  { name: "Hafa", slug: "hafa", description: "Tantara tsy mety amin'ny sokajy hafa." },
];

async function seedUser() {
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

// Idempotent: azo atao isaky ny deploy, tsy manoratra ambony ny sokajy efa novaina.
async function seedCategories() {
  for (const c of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
  }
  console.log(`Sokajy: ${DEFAULT_CATEGORIES.length} voamarina fa misy.`);
}

async function main() {
  await seedUser();
  await seedCategories();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
