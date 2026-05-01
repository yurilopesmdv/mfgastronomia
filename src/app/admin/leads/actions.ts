"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");
}

export async function deleteLead(id: string) {
  await requireAdmin();
  if (!id) return { ok: false as const, error: "ID inválido" };
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  return { ok: true as const };
}
