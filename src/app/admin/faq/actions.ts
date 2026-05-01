"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { faqSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");
}

function revalidateAll() {
  revalidatePath("/admin/faq");
  revalidatePath("/");
  revalidatePath("/perguntas-frequentes");
}

export async function createFaqAction(rawInput: unknown) {
  await requireAdmin();
  const parsed = faqSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, error: "Dados inválidos" };
  }
  await prisma.faq.create({ data: parsed.data });
  revalidateAll();
  return { ok: true as const };
}

export async function updateFaqAction(id: string, rawInput: unknown) {
  await requireAdmin();
  const parsed = faqSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, error: "Dados inválidos" };
  }
  await prisma.faq.update({ where: { id }, data: parsed.data });
  revalidateAll();
  return { ok: true as const };
}

export async function deleteFaqAction(id: string) {
  await requireAdmin();
  await prisma.faq.delete({ where: { id } });
  revalidateAll();
  return { ok: true as const };
}
