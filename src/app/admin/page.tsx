import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

function parseEventDate(s: string | null): Date | null {
  if (!s) return null;
  // ISO yyyy-mm-dd
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    const d = new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }
  // dd/mm/yyyy
  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (br) {
    const d = new Date(`${br[3]}-${br[2]}-${br[1]}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  }
  const fallback = new Date(s);
  return isNaN(fallback.getTime()) ? null : fallback;
}

export default async function AdminDashboard() {
  const now = new Date();
  const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    menuCount,
    portfolioCount,
    leadCount,
    leads7,
    leads30,
    quotes30,
    recentLeads,
    futureLeads,
  ] = await Promise.all([
    prisma.menu.count(),
    prisma.portfolioImage.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { createdAt: { gte: last7 } } }),
    prisma.lead.count({ where: { createdAt: { gte: last30 } } }),
    prisma.lead.findMany({
      where: {
        source: "MENU_QUOTE",
        createdAt: { gte: last30 },
        calculatedTotal: { not: null },
      },
      select: { calculatedTotal: true },
    }),
    prisma.lead.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { menu: { select: { name: true } } },
    }),
    prisma.lead.findMany({
      where: {
        source: "MENU_QUOTE",
        eventDate: { not: null },
      },
      orderBy: { createdAt: "desc" },
      include: { menu: { select: { name: true } } },
      take: 50,
    }),
  ]);

  const ticketAvg =
    quotes30.length > 0
      ? quotes30.reduce((sum, l) => sum + Number(l.calculatedTotal ?? 0), 0) /
        quotes30.length
      : 0;

  const upcomingEvents = futureLeads
    .map((l) => ({ ...l, parsedDate: parseEventDate(l.eventDate) }))
    .filter((l) => l.parsedDate && l.parsedDate >= now)
    .sort((a, b) => (a.parsedDate!.getTime() - b.parsedDate!.getTime()))
    .slice(0, 8);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          Conversão
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Leads (últimos 7 dias)" value={leads7} />
          <StatCard label="Leads (últimos 30 dias)" value={leads30} />
          <StatCard
            label="Ticket médio (orçamentos 30 dias)"
            value={ticketAvg > 0 ? formatBRL(ticketAvg) : "—"}
          />
          <StatCard label="Próximos eventos" value={upcomingEvents.length} />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          Cadastros totais
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Cardápios" value={menuCount} />
          <StatCard label="Imagens do portfólio" value={portfolioCount} />
          <StatCard label="Leads totais" value={leadCount} />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Próximos eventos</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum evento futuro agendado pelos leads.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-3">Quando</th>
                    <th className="py-2 pr-3">Cliente</th>
                    <th className="py-2 pr-3">Telefone</th>
                    <th className="py-2 pr-3">Cardápio</th>
                    <th className="py-2 pr-3">Pessoas</th>
                    <th className="py-2 pr-3">Local</th>
                    <th className="py-2 pr-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingEvents.map((l) => (
                    <tr key={l.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 whitespace-nowrap">
                        {l.parsedDate!.toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-2 pr-3">{l.name}</td>
                      <td className="py-2 pr-3">{l.phone}</td>
                      <td className="py-2 pr-3">{l.menu?.name ?? "-"}</td>
                      <td className="py-2 pr-3">{l.peopleCount ?? "-"}</td>
                      <td className="py-2 pr-3">
                        {l.city && l.neighborhood
                          ? `${l.city} - ${l.neighborhood}`
                          : l.city || "-"}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <CardTitle>Leads recentes</CardTitle>
          <Link
            href="/admin/leads"
            prefetch
            className="text-sm text-primary hover:underline"
          >
            Ver todos →
          </Link>
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
                        {l.source === "QUICK_CONTACT" ? (
                          <Badge variant="secondary">Contato</Badge>
                        ) : (
                          <Badge>Orçamento</Badge>
                        )}
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

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <Card>
      <CardContent className="py-4">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="mt-1 text-3xl font-semibold tabular-nums">{value}</div>
      </CardContent>
    </Card>
  );
}
