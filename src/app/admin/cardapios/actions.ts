"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { menuSchema } from "@/lib/validators";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado");
}

export async function createMenuAction(rawInput: unknown) {
  await requireAdmin();
  const parsed = menuSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Dados inválidos",
      issues: parsed.error.flatten().fieldErrors,
    };
  }
  const { items, galleryImages, addons, priceTiers, ...rest } = parsed.data;

  const slugTaken = await prisma.menu.findUnique({
    where: { slug: rest.slug },
    select: { id: true },
  });
  if (slugTaken) {
    return { ok: false as const, error: "Slug já está em uso" };
  }

  // Faixas devem ter minPeople único — validamos antes de tocar no banco
  if (priceTiers && priceTiers.length) {
    const set = new Set<number>();
    for (const t of priceTiers) {
      if (set.has(t.minPeople)) {
        return {
          ok: false as const,
          error: "Existem faixas de preço com a mesma quantidade mínima de pessoas",
        };
      }
      set.add(t.minPeople);
    }
  }

  const created = await prisma.menu.create({
    data: {
      ...rest,
      items: { create: items },
      galleryImages: { create: galleryImages },
      addons: addons && addons.length ? { create: addons } : undefined,
      priceTiers:
        priceTiers && priceTiers.length ? { create: priceTiers } : undefined,
    },
    select: { id: true },
  });

  revalidatePath("/admin/cardapios");
  revalidatePath("/cardapios");
  revalidatePath("/");
  redirect(`/admin/cardapios/${created.id}`);
}

export async function updateMenuAction(id: string, rawInput: unknown) {
  await requireAdmin();
  const parsed = menuSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      ok: false as const,
      error: "Dados inválidos",
      issues: parsed.error.flatten().fieldErrors,
    };
  }
  const { items, galleryImages, addons, priceTiers, ...rest } = parsed.data;

  const slugTaken = await prisma.menu.findFirst({
    where: { slug: rest.slug, NOT: { id } },
    select: { id: true },
  });
  if (slugTaken) {
    return { ok: false as const, error: "Slug já está em uso" };
  }

  if (priceTiers && priceTiers.length) {
    const set = new Set<number>();
    for (const t of priceTiers) {
      if (set.has(t.minPeople)) {
        return {
          ok: false as const,
          error: "Existem faixas de preço com a mesma quantidade mínima de pessoas",
        };
      }
      set.add(t.minPeople);
    }
  }

  await prisma.$transaction([
    prisma.menu.update({ where: { id }, data: rest }),
    prisma.menuItem.deleteMany({ where: { menuId: id } }),
    prisma.menuGalleryImage.deleteMany({ where: { menuId: id } }),
    prisma.menuAddon.deleteMany({ where: { menuId: id } }),
    prisma.menuPriceTier.deleteMany({ where: { menuId: id } }),
    ...(items.length
      ? [prisma.menuItem.createMany({ data: items.map((i) => ({ ...i, menuId: id })) })]
      : []),
    ...(galleryImages.length
      ? [
          prisma.menuGalleryImage.createMany({
            data: galleryImages.map((g) => ({ ...g, menuId: id })),
          }),
        ]
      : []),
    ...(addons && addons.length
      ? [
          prisma.menuAddon.createMany({
            data: addons.map((a) => ({ ...a, menuId: id })),
          }),
        ]
      : []),
    ...(priceTiers && priceTiers.length
      ? [
          prisma.menuPriceTier.createMany({
            data: priceTiers.map((t) => ({ ...t, menuId: id })),
          }),
        ]
      : []),
  ]);

  revalidatePath("/admin/cardapios");
  revalidatePath("/admin/cardapios/" + id);
  revalidatePath("/cardapios");
  revalidatePath("/");
  return { ok: true as const };
}

export async function deleteMenuAction(id: string) {
  await requireAdmin();
  await prisma.menu.delete({ where: { id } });
  revalidatePath("/admin/cardapios");
  revalidatePath("/cardapios");
  revalidatePath("/");
}
