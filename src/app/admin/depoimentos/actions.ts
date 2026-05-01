"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { testimonialSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");
}

function revalidateAll() {
  revalidatePath("/admin/depoimentos");
  revalidatePath("/");
}

export async function createTestimonialAction(rawInput: unknown) {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, error: "Dados inválidos" };
  }
  await prisma.testimonial.create({ data: parsed.data });
  revalidateAll();
  return { ok: true as const };
}

export async function updateTestimonialAction(id: string, rawInput: unknown) {
  await requireAdmin();
  const parsed = testimonialSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { ok: false as const, error: "Dados inválidos" };
  }
  await prisma.testimonial.update({ where: { id }, data: parsed.data });
  revalidateAll();
  return { ok: true as const };
}

export async function deleteTestimonialAction(id: string) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidateAll();
  return { ok: true as const };
}
