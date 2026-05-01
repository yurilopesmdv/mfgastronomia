import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MenuForm } from "../menu-form";

export default async function EditMenuPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const menu = await prisma.menu.findUnique({
    where: { id },
    include: {
      items: { orderBy: { order: "asc" } },
      galleryImages: { orderBy: { order: "asc" } },
      addons: { orderBy: [{ order: "asc" }, { createdAt: "asc" }] },
    },
  });
  if (!menu) notFound();

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Editar cardápio</h1>
      <MenuForm
        mode="edit"
        initial={{
          id: menu.id,
          name: menu.name,
          slug: menu.slug,
          description: menu.description,
          mainImageUrl: menu.mainImageUrl,
          pricePerPerson: Number(menu.pricePerPerson),
          minPeople: menu.minPeople,
          isActive: menu.isActive,
          order: menu.order,
          items: menu.items.map((i) => ({
            category: i.category,
            name: i.name,
            order: i.order,
          })),
          galleryImages: menu.galleryImages.map((g) => ({
            url: g.url,
            order: g.order,
          })),
          addons: menu.addons.map((a) => ({
            name: a.name,
            description: a.description,
            pricePerPerson: Number(a.pricePerPerson),
            order: a.order,
            isActive: a.isActive,
          })),
        }}
      />
    </div>
  );
}
