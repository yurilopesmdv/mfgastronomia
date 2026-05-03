import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function csvEscape(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function buildWhere(sp: URLSearchParams): Prisma.LeadWhereInput {
  const where: Prisma.LeadWhereInput = {};
  const q = sp.get("q");
  if (q?.trim()) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { phone: { contains: q.replace(/\D/g, "") || q } },
    ];
  }
  const source = sp.get("source");
  if (source === "QUICK_CONTACT" || source === "MENU_QUOTE") {
    where.source = source;
  }
  const from = sp.get("from");
  const to = sp.get("to");
  const created: Prisma.DateTimeFilter = {};
  if (from) {
    const d = new Date(`${from}T00:00:00`);
    if (!isNaN(d.getTime())) created.gte = d;
  }
  if (to) {
    const d = new Date(`${to}T23:59:59.999`);
    if (!isNaN(d.getTime())) created.lte = d;
  }
  if (created.gte || created.lte) where.createdAt = created;
  return where;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const where = buildWhere(req.nextUrl.searchParams);
  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { menu: { select: { name: true } } },
    take: 5000,
  });

  const headers = [
    "Quando",
    "Tipo",
    "Nome",
    "Telefone",
    "Cardápio",
    "Pessoas",
    "Data evento",
    "Cidade",
    "Bairro",
    "Adicionais",
    "Total",
  ];

  function formatAddons(value: unknown): string {
    if (!Array.isArray(value)) return "";
    const parts: string[] = [];
    for (const item of value) {
      if (!item || typeof item !== "object") continue;
      const rec = item as Record<string, unknown>;
      const name = String(rec.name ?? "");
      if (!name) continue;
      const price = Number(rec.pricePerPerson ?? 0);
      parts.push(`${name} (+${price.toFixed(2)}/p)`);
    }
    return parts.join(" | ");
  }

  const rows = leads.map((l) => [
    new Date(l.createdAt).toLocaleString("pt-BR"),
    l.source === "QUICK_CONTACT" ? "Contato" : "Orçamento",
    l.name,
    l.phone,
    l.menu?.name ?? "",
    l.peopleCount ?? "",
    l.eventDate ?? "",
    l.city ?? "",
    l.neighborhood ?? "",
    formatAddons(l.selectedAddons),
    l.calculatedTotal ? Number(l.calculatedTotal).toFixed(2) : "",
  ]);

  // BOM UTF-8 para Excel reconhecer acentuação
  const csv =
    "﻿" +
    [headers, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n");

  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
