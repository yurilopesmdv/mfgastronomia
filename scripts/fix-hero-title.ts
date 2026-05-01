/**
 * Corrige idempotentemente o sufixo errado " 2" no heroTitle do SiteSettings.
 *
 * Uso:
 *   npx tsx scripts/fix-hero-title.ts
 *
 * Não sobrescreve se o título já estiver correto.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
    select: { heroTitle: true },
  });

  if (!settings) {
    console.log("Nenhum SiteSettings encontrado. Rode `npm run db:seed` antes.");
    return;
  }

  const original = settings.heroTitle;
  // Remove " 2" (ou "2") soltos no final, mas preserva qualquer outra
  // edição que o cliente tenha feito.
  const fixed = original.replace(/\s*2\s*$/g, "").trim();

  if (fixed === original) {
    console.log(`heroTitle já está OK: "${original}"`);
    return;
  }

  await prisma.siteSettings.update({
    where: { id: "default" },
    data: { heroTitle: fixed },
  });

  console.log(`heroTitle corrigido:`);
  console.log(`  antes: "${original}"`);
  console.log(`  depois: "${fixed}"`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
