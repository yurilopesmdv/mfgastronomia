"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");
  return session.user;
}

export async function createUser(rawInput: unknown) {
  await requireAdmin();
  const parsed = createUserSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Dados inválidos",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  const exists = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (exists) return { ok: false as const, error: "Email já cadastrado" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
    },
  });

  revalidatePath("/admin/usuarios");
  return { ok: true as const };
}

export async function deleteUser(id: string) {
  const me = await requireAdmin();
  if (me.id === id) {
    return { ok: false as const, error: "Não é possível deletar a própria conta" };
  }
  const total = await prisma.user.count();
  if (total <= 1) {
    return { ok: false as const, error: "Não é possível deletar o último admin" };
  }
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
  return { ok: true as const };
}
