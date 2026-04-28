import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function AdminCardapiosPage() {
  const menus = await prisma.menu.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { _count: { select: { items: true, galleryImages: true } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Cardápios</h1>
        <Button
          render={<Link href="/admin/cardapios/novo" />}
          nativeButton={false}
        >
          Novo cardápio
        </Button>
      </div>

      {menus.length === 0 ? (
        <p className="text-muted-foreground">Nenhum cardápio cadastrado.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="p-3">Nome</th>
                <th className="p-3">Slug</th>
                <th className="p-3 text-right">Preço/pessoa</th>
                <th className="p-3 text-center">Itens</th>
                <th className="p-3 text-center">Galeria</th>
                <th className="p-3 text-center">Status</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody>
              {menus.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="p-3 font-medium">{m.name}</td>
                  <td className="p-3 text-muted-foreground">{m.slug}</td>
                  <td className="p-3 text-right tabular-nums">
                    {formatBRL(Number(m.pricePerPerson))}
                  </td>
                  <td className="p-3 text-center">{m._count.items}</td>
                  <td className="p-3 text-center">{m._count.galleryImages}</td>
                  <td className="p-3 text-center">
                    {m.isActive ? (
                      <Badge>Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      render={<Link href={`/admin/cardapios/${m.id}`} />}
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                    >
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
