/** "Tantaram-pitiavana" -> "tantaram-pitiavana"; manala ny accent sy ny tarehintsoratra tsy azo ampiasaina amin'ny URL. */
export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Fanampiana: slug tsy foana na dia misy anarana feno tarehintsoratra tsy latina aza. */
export function makeSlug(name: string): string {
  return slugify(name) || `sokajy-${Date.now().toString(36)}`;
}

/** P2002 = unique constraint violation (Prisma). */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
}

/** P2003 = foreign key violation (Prisma). */
export function isForeignKeyViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2003";
}
