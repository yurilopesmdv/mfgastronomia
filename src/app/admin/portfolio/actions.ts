"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { portfolioImageSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");
}

export async function addPortfolioImage(rawInput: unknown) {
  await requireAdmin();
  const parsed = portfolioImageSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, error: "Dados inválidos" };
  }
  await prisma.portfolioImage.create({ data: parsed.data });
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deletePortfolioImage(id: string) {
  await requireAdmin();
  await prisma.portfolioImage.delete({ where: { id } });
  revalidatePath("/admin/portfolio");
  revalidatePath("/portfolio");
  revalidatePath("/");
}
