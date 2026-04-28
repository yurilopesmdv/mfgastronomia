"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { siteSettingsSchema } from "@/lib/validators";
import { DEFAULT_SETTINGS_ID } from "@/lib/site-settings";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");
}

export async function updateSiteSettings(rawInput: unknown) {
  await requireAdmin();
  const parsed = siteSettingsSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Dados inválidos",
      issues: parsed.error.flatten().fieldErrors,
    };
  }

  await prisma.siteSettings.upsert({
    where: { id: DEFAULT_SETTINGS_ID },
    create: { id: DEFAULT_SETTINGS_ID, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/", "layout");
  return { ok: true as const };
}
