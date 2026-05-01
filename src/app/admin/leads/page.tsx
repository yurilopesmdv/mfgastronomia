import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatBRL } from "@/lib/whatsapp";
import { LeadDeleteButton } from "./lead-delete-button";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 25;

type SP = {
  q?: string;
  from?: string;
  to?: string;
  source?: string;
  page?: string;
};

type AddonSnapshot = { id: string; name: string; pricePerPerson: number };

function parseSelectedAddons(value: unknown): AddonSnapshot[] {
  if (!Array.isArray(value)) return [];
  const out: AddonSnapshot[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const rec = item as Record<string, unknown>;
    const name = String(rec.name ?? "");
    if (!name) continue;
    out.push({
      id: String(rec.id ?? ""),
      name,
      pricePerPerson: Number(rec.pricePerPerson ?? 0),
    });
  }
  return out;
}

function buildWhere(sp: SP): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};

  if (sp.q?.trim()) {
    const q = sp.q.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q.replace(/\D/g, "") || q } },
    ];
  }

  if (sp.source === "QUICK_CONTACT" || sp.source === "MENU_QUOTE") {
    where.source = sp.source;
  }

  const created: Prisma.DateTimeFilter = {};
  if (sp.from) {
    const d = new Date(`${sp.from}T00:00:00`);
    if (!isNaN(d.getTime())) created.gte = d;
  }
  if (sp.to) {
    const d = new Date(`${sp.to}T23:59:59.999`);
    if (!isNaN(d.getTime())) created.lte = d;
  }
  if (created.gte || created.lte) where.createdAt = created;

  return where;
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const where = buildWhere(sp);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const [total, leads] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { menu: { select: { name: true } } },
      take: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Construir querystring para exportar CSV preservando filtros atuais
  const exportParams = new URLSearchParams();
  if (sp.q) exportParams.set("q", sp.q);
  if (sp.from) exportParams.set("from", sp.from);
  if (sp.to) exportParams.set("to", sp.to);
  if (sp.source) exportParams.set("source", sp.source);
  const csvUrl = `/api/admin/leads/export.csv${
    exportParams.size ? `?${exportParams.toString()}` : ""
  }`;

  function pageHref(p: number) {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.from) params.set("from", sp.from);
    if (sp.to) params.set("to", sp.to);
    if (sp.source) params.set("source", sp.source);
    if (p > 1) params.set("page", String(p));
    return `/admin/leads${params.size ? `?${params.toString()}` : ""}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Leads recebidos</h1>
        <Button render={<a href={csvUrl} />} variant="outline" nativeButton={false}>
          Exportar CSV
        </Button>
      </div>

      <Card>
        <CardContent className="py-4">
          <form className="grid gap-4 md:grid-cols-5">
            <div className="space-y-1 md:col-span-2">
              <Label htmlFor="q">Buscar por nome ou telefone</Label>
              <Input
                id="q"
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Maria, 41..."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="from">De</Label>
              <Input id="from" name="from" type="date" defaultValue={sp.from ?? ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="to">Até</Label>
              <Input id="to" name="to" type="date" defaultValue={sp.to ?? ""} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="source">Tipo</Label>
              <Select name="source" defaultValue={sp.source ?? "all"}>
                <SelectTrigger id="source">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="QUICK_CONTACT">Contato rápido</SelectItem>
                  <SelectItem value="MENU_QUOTE">Orçamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-5 flex flex-wrap gap-2">
              <Button type="submit">Aplicar filtros</Button>
              <Button variant="outline" render={<Link href="/admin/leads" />} nativeButton={false}>
                Limpar
              </Button>
              <span className="ml-auto self-center text-sm text-muted-foreground">
                {total} resultado{total === 1 ? "" : "s"}
              </span>
            </div>
          </form>
        </CardContent>
      </Card>

      {leads.length === 0 ? (
        <p className="text-muted-foreground">Nenhum lead encontrado.</p>
      ) : (
        <>
          {/* Tabela (sm e acima) */}
          <div className="hidden sm:block overflow-x-auto rounded-md border">
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
                  <th className="p-3 text-right w-[1%]">Ações</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const addons = parseSelectedAddons(l.selectedAddons);
                  return (
                    <tr key={l.id} className="border-t align-top">
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
                      <td className="p-3 font-medium">
                        {l.name}
                        {addons.length > 0 && (
                          <ul className="mt-1 text-xs font-normal text-muted-foreground">
                            {addons.map((a) => (
                              <li key={a.id}>
                                + {a.name} ({formatBRL(a.pricePerPerson)}/p)
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                      <td className="p-3">{l.phone}</td>
                      <td className="p-3">{l.menu?.name ?? "-"}</td>
                      <td className="p-3">{l.peopleCount ?? "-"}</td>
                      <td className="p-3">{l.waitersCount ?? "-"}</td>
                      <td className="p-3">{l.eventDate ?? "-"}</td>
                      <td className="p-3">
                        {l.city && l.neighborhood
                          ? `${l.city} - ${l.neighborhood}`
                          : l.city || "-"}
                      </td>
                      <td className="p-3 text-right tabular-nums">
                        {l.calculatedTotal
                          ? formatBRL(Number(l.calculatedTotal))
                          : "-"}
                      </td>
                      <td className="p-3 text-right">
                        <LeadDeleteButton id={l.id} leadName={l.name} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Cards (mobile, < sm) */}
          <div className="sm:hidden space-y-3">
            {leads.map((l) => {
              const addons = parseSelectedAddons(l.selectedAddons);
              return (
                <Card key={l.id}>
                  <CardContent className="py-4 space-y-2 text-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold">{l.name}</div>
                      {l.source === "QUICK_CONTACT" ? (
                        <Badge variant="secondary">Contato</Badge>
                      ) : (
                        <Badge>Orçamento</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleString("pt-BR")}
                    </div>
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                      <dt className="text-muted-foreground">Telefone</dt>
                      <dd>{l.phone}</dd>
                      {l.menu?.name && (
                        <>
                          <dt className="text-muted-foreground">Cardápio</dt>
                          <dd>{l.menu.name}</dd>
                        </>
                      )}
                      {l.peopleCount != null && (
                        <>
                          <dt className="text-muted-foreground">Pessoas</dt>
                          <dd>{l.peopleCount}</dd>
                        </>
                      )}
                      {l.waitersCount != null && (
                        <>
                          <dt className="text-muted-foreground">Garçons</dt>
                          <dd>{l.waitersCount}</dd>
                        </>
                      )}
                      {l.eventDate && (
                        <>
                          <dt className="text-muted-foreground">Data evento</dt>
                          <dd>{l.eventDate}</dd>
                        </>
                      )}
                      {(l.city || l.neighborhood) && (
                        <>
                          <dt className="text-muted-foreground">Local</dt>
                          <dd>
                            {l.city && l.neighborhood
                              ? `${l.city} - ${l.neighborhood}`
                              : l.city || "-"}
                          </dd>
                        </>
                      )}
                      {l.calculatedTotal && (
                        <>
                          <dt className="text-muted-foreground">Total</dt>
                          <dd className="font-medium tabular-nums">
                            {formatBRL(Number(l.calculatedTotal))}
                          </dd>
                        </>
                      )}
                    </dl>
                    {addons.length > 0 && (
                      <div className="pt-1 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">
                          Adicionais:
                        </p>
                        <ul className="text-xs space-y-0.5">
                          {addons.map((a) => (
                            <li key={a.id}>
                              + {a.name} ({formatBRL(a.pricePerPerson)}/pessoa)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="pt-2 flex justify-end">
                      <LeadDeleteButton
                        id={l.id}
                        leadName={l.name}
                        variant="full"
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Página {page} de {totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  render={<Link href={pageHref(Math.max(1, page - 1))} />}
                  nativeButton={false}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  render={<Link href={pageHref(Math.min(totalPages, page + 1))} />}
                  nativeButton={false}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
