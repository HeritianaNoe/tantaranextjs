import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret");

const DEFAULT_NAME = "admin";
const DEFAULT_PASSWORD = "zakaranda";

export async function createToken(userId?: string, name?: string) {
  return new SignJWT({ role: "admin", userId, name })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("8h")
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function isAuthenticated() {
  const cookieStore = cookies();
  const token = cookieStore.get("admin_token")?.value;
  if (!token) return false;
  const payload = await verifyToken(token);
  return !!payload;
}

/** Hash password with scrypt. Stored as salt:hash (hex). */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, key] = stored.split(":");
  if (!salt || !key) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const keyBuf = Buffer.from(key, "hex");
  if (derived.length !== keyBuf.length) return false;
  return timingSafeEqual(derived, keyBuf);
}

/** Ensure default admin user exists when table is empty. */
async function ensureDefaultUser() {
  if (!prisma.user) return null;
  const count = await prisma.user.count();
  if (count > 0) return null;
  const hashed = await hashPassword(DEFAULT_PASSWORD);
  const user = await prisma.user.create({
    data: { name: DEFAULT_NAME, password: hashed },
  });
  console.log("[auth] User par défaut noforonina: admin / zakaranda");
  return user;
}

/**
 * Authenticate by name + password against DB users.
 * If no users exist, creates default admin/zakaranda then authenticates.
 * Also accepts ADMIN_PASSWORD from env as bootstrap.
 */
export async function authenticateUser(password: string, name?: string) {
  try {
    if (!prisma.user) {
      if (
        password === process.env.ADMIN_PASSWORD ||
        password === DEFAULT_PASSWORD
      ) {
        return { id: "bootstrap", name: name?.trim() || DEFAULT_NAME };
      }
      return null;
    }

    await ensureDefaultUser();

    const loginName = (name?.trim() || DEFAULT_NAME).toLowerCase();

    const user = await prisma.user.findFirst({
      where: { name: { equals: loginName, mode: "insensitive" } },
    });

    if (user && (await verifyPassword(password, user.password))) {
      return { id: user.id, name: user.name };
    }

    // Bootstrap env password (any name)
    if (password === process.env.ADMIN_PASSWORD) {
      return { id: "bootstrap", name: name?.trim() || DEFAULT_NAME };
    }

    return null;
  } catch (err) {
    console.error("[auth] DB error:", err);
    if (
      password === process.env.ADMIN_PASSWORD ||
      password === DEFAULT_PASSWORD
    ) {
      return { id: "bootstrap", name: name?.trim() || DEFAULT_NAME };
    }
    return null;
  }
}
