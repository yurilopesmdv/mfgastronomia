import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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
        <>
          {/* Tabela (sm e acima) */}
          <div className="hidden sm:block overflow-x-auto rounded-md border">
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

          {/* Cards (mobile, < sm) */}
          <div className="sm:hidden space-y-3">
            {menus.map((m) => (
              <Card key={m.id}>
                <CardContent className="py-4 space-y-2 text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold">{m.name}</div>
                    {m.isActive ? (
                      <Badge>Ativo</Badge>
                    ) : (
                      <Badge variant="secondary">Inativo</Badge>
                    )}
                  </div>
                  <dl className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                    <dt className="text-muted-foreground">Slug</dt>
                    <dd className="truncate">{m.slug}</dd>
                    <dt className="text-muted-foreground">Preço/pessoa</dt>
                    <dd className="tabular-nums">
                      {formatBRL(Number(m.pricePerPerson))}
                    </dd>
                    <dt className="text-muted-foreground">Itens</dt>
                    <dd>{m._count.items}</dd>
                    <dt className="text-muted-foreground">Galeria</dt>
                    <dd>{m._count.galleryImages}</dd>
                  </dl>
                  <div className="pt-2">
                    <Button
                      render={<Link href={`/admin/cardapios/${m.id}`} />}
                      nativeButton={false}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      Editar cardápio
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
