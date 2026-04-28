import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBRL } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [menuCount, portfolioCount, leadCount, recentLeads] = await Promise.all([
    prisma.menu.count(),
    prisma.portfolioImage.count(),
    prisma.lead.count(),
    prisma.lead.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { menu: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Cardápios" value={menuCount} />
        <StatCard label="Imagens do portfólio" value={portfolioCount} />
        <StatCard label="Leads totais" value={leadCount} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leads recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lead ainda.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-3">Quando</th>
                    <th className="py-2 pr-3">Tipo</th>
                    <th className="py-2 pr-3">Nome</th>
                    <th className="py-2 pr-3">Telefone</th>
                    <th className="py-2 pr-3">Cardápio</th>
                    <th className="py-2 pr-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((l) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {new Date(l.createdAt).toLocaleString("pt-BR")}
                      </td>
                      <td className="py-2 pr-3">
                        {l.source === "QUICK_CONTACT" ? "Contato" : "Orçamento"}
                      </td>
                      <td className="py-2 pr-3">{l.name}</td>
                      <td className="py-2 pr-3">{l.phone}</td>
                      <td className="py-2 pr-3">{l.menu?.name ?? "-"}</td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {l.calculatedTotal ? formatBRL(Number(l.calculatedTotal)) : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
