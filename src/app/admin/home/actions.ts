"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { homeFeatureSchema, homeStepSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");
}

function revalidateHome() {
  revalidatePath("/admin/home");
  revalidatePath("/");
}

// Features
export async function createFeatureAction(rawInput: unknown) {
  await requireAdmin();
  const parsed = homeFeatureSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false as const, error: "Dados inválidos" };
  await prisma.homeFeature.create({ data: parsed.data });
  revalidateHome();
  return { ok: true as const };
}

export async function updateFeatureAction(id: string, rawInput: unknown) {
  await requireAdmin();
  const parsed = homeFeatureSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false as const, error: "Dados inválidos" };
  await prisma.homeFeature.update({ where: { id }, data: parsed.data });
  revalidateHome();
  return { ok: true as const };
}

export async function deleteFeatureAction(id: string) {
  await requireAdmin();
  await prisma.homeFeature.delete({ where: { id } });
  revalidateHome();
  return { ok: true as const };
}

// Steps
export async function createStepAction(rawInput: unknown) {
  await requireAdmin();
  const parsed = homeStepSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false as const, error: "Dados inválidos" };
  await prisma.homeStep.create({ data: parsed.data });
  revalidateHome();
  return { ok: true as const };
}

export async function updateStepAction(id: string, rawInput: unknown) {
  await requireAdmin();
  const parsed = homeStepSchema.safeParse(rawInput);
  if (!parsed.success) return { ok: false as const, error: "Dados inválidos" };
  await prisma.homeStep.update({ where: { id }, data: parsed.data });
  revalidateHome();
  return { ok: true as const };
}

export async function deleteStepAction(id: string) {
  await requireAdmin();
  await prisma.homeStep.delete({ where: { id } });
  revalidateHome();
  return { ok: true as const };
}
