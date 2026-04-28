import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { menu: { select: { name: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Leads recebidos</h1>

      {leads.length === 0 ? (
        <p className="text-muted-foreground">Nenhum lead ainda.</p>
      ) : (
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="p-3">Quando</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Nome</th>
                <th className="p-3">Telefone</th>
                <th className="p-3">Cardápio</th>
                <th className="p-3">Pessoas</th>
                <th className="p-3">Garçons</th>
                <th className="p-3">Data evento</th>
                <th className="p-3">Local</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-t">
                  <td className="p-3 whitespace-nowrap text-muted-foreground">
                    {new Date(l.createdAt).toLocaleString("pt-BR")}
                  </td>
                  <td className="p-3">
                    {l.source === "QUICK_CONTACT" ? (
                      <Badge variant="secondary">Contato</Badge>
                    ) : (
                      <Badge>Orçamento</Badge>
                    )}
                  </td>
                  <td className="p-3 font-medium">{l.name}</td>
                  <td className="p-3">{l.phone}</td>
                  <td className="p-3">{l.menu?.name ?? "-"}</td>
                  <td className="p-3">{l.peopleCount ?? "-"}</td>
                  <td className="p-3">{l.waitersCount ?? "-"}</td>
                  <td className="p-3">{l.eventDate ?? "-"}</td>
                  <td className="p-3">
                    {l.city && l.neighborhood ? `${l.city} - ${l.neighborhood}` : "-"}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {l.calculatedTotal
                      ? formatBRL(Number(l.calculatedTotal))
                      : "-"}
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
