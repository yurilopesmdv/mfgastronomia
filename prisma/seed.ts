import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FAKE_IMAGE = (seed: string) =>
  `https://picsum.photos/seed/${seed}/1600/1200`;

async function main() {
  // Site settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      whatsappNumber: "5541999999999",
      defaultContactMessage:
        "Olá! Tenho interesse em contratar a MF Gastronomia para um evento. Podemos conversar?",
      heroTitle: "Churrasco premium no seu evento",
      heroSubtitle:
        "Levamos toda a estrutura, sabor e atendimento até você. Aperitivos, carnes nobres e acompanhamentos sob medida.",
      aboutText:
        "A MF Gastronomia leva o melhor do churrasco para o local do seu evento. Trabalhamos com cortes selecionados, equipe treinada e cardápios pensados para cada ocasião — de confraternizações a casamentos.",
      contactText:
        "Solicite seu orçamento pelo WhatsApp e em poucos minutos retornamos com todas as informações.",
      waiterAdditionalPrice: 250,
    },
    update: {},
  });

  // Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@mfgastronomia.com.br";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "trocar-esta-senha";
  const adminName = process.env.SEED_ADMIN_NAME ?? "Admin";

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.upsert({
    where: { email: adminEmail },
    create: { email: adminEmail, passwordHash, name: adminName },
    update: { passwordHash, name: adminName },
  });

  // Menus (idempotente via slug)
  const menus = [
    {
      slug: "tradicional",
      name: "Tradicional",
      description:
        "Cardápio clássico para confraternizações: aperitivos, três tipos de carne e acompanhamentos tradicionais.",
      mainImageUrl: FAKE_IMAGE("mf-tradicional-main"),
      pricePerPerson: 79.9,
      order: 0,
      items: [
        { category: "APERITIVO" as const, name: "Bruschetta de tomate", order: 0 },
        { category: "APERITIVO" as const, name: "Pão de alho na chapa", order: 1 },
        { category: "CARNE" as const, name: "Picanha", order: 0 },
        { category: "CARNE" as const, name: "Linguiça artesanal", order: 1 },
        { category: "CARNE" as const, name: "Frango com bacon", order: 2 },
        { category: "ACOMPANHAMENTO" as const, name: "Arroz branco", order: 0 },
        { category: "ACOMPANHAMENTO" as const, name: "Farofa", order: 1 },
        { category: "ACOMPANHAMENTO" as const, name: "Vinagrete", order: 2 },
        { category: "ACOMPANHAMENTO" as const, name: "Salada verde", order: 3 },
      ],
      gallery: [
        FAKE_IMAGE("mf-tradicional-1"),
        FAKE_IMAGE("mf-tradicional-2"),
      ],
    },
    {
      slug: "premium",
      name: "Premium",
      description:
        "Cinco cortes nobres, aperitivos diferenciados e acompanhamentos elaborados para eventos sofisticados.",
      mainImageUrl: FAKE_IMAGE("mf-premium-main"),
      pricePerPerson: 119.9,
      order: 1,
      items: [
        { category: "APERITIVO" as const, name: "Tábua de queijos e frios", order: 0 },
        { category: "APERITIVO" as const, name: "Bruschetta com pesto", order: 1 },
        { category: "APERITIVO" as const, name: "Mini empanadas", order: 2 },
        { category: "CARNE" as const, name: "Picanha angus", order: 0 },
        { category: "CARNE" as const, name: "Costela de cordeiro", order: 1 },
        { category: "CARNE" as const, name: "Maminha", order: 2 },
        { category: "CARNE" as const, name: "Filé mignon", order: 3 },
        { category: "CARNE" as const, name: "Linguiça defumada", order: 4 },
        { category: "ACOMPANHAMENTO" as const, name: "Arroz com brócolis", order: 0 },
        { category: "ACOMPANHAMENTO" as const, name: "Farofa de banana", order: 1 },
        { category: "ACOMPANHAMENTO" as const, name: "Vinagrete tropical", order: 2 },
        { category: "ACOMPANHAMENTO" as const, name: "Salada Caesar", order: 3 },
        { category: "ACOMPANHAMENTO" as const, name: "Pão de alho recheado", order: 4 },
      ],
      gallery: [
        FAKE_IMAGE("mf-premium-1"),
        FAKE_IMAGE("mf-premium-2"),
        FAKE_IMAGE("mf-premium-3"),
      ],
    },
    {
      slug: "premium-plus",
      name: "Premium Plus",
      description:
        "O que temos de melhor: oito cortes nobres, aperitivos exclusivos, sobremesa e atendimento completo.",
      mainImageUrl: FAKE_IMAGE("mf-plus-main"),
      pricePerPerson: 159.9,
      order: 2,
      items: [
        { category: "APERITIVO" as const, name: "Tábua de queijos premium", order: 0 },
        { category: "APERITIVO" as const, name: "Bruschettas variadas", order: 1 },
        { category: "APERITIVO" as const, name: "Mini hambúrgueres gourmet", order: 2 },
        { category: "APERITIVO" as const, name: "Camarão empanado", order: 3 },
        { category: "CARNE" as const, name: "Picanha argentina", order: 0 },
        { category: "CARNE" as const, name: "Costela de cordeiro", order: 1 },
        { category: "CARNE" as const, name: "Maminha angus", order: 2 },
        { category: "CARNE" as const, name: "Filé mignon ao molho madeira", order: 3 },
        { category: "CARNE" as const, name: "Salmão grelhado", order: 4 },
        { category: "CARNE" as const, name: "Frango recheado", order: 5 },
        { category: "CARNE" as const, name: "Linguiça artesanal", order: 6 },
        { category: "CARNE" as const, name: "Costela bovina 12h", order: 7 },
        { category: "ACOMPANHAMENTO" as const, name: "Risoto de funghi", order: 0 },
        { category: "ACOMPANHAMENTO" as const, name: "Batatas rústicas", order: 1 },
        { category: "ACOMPANHAMENTO" as const, name: "Farofa especial", order: 2 },
        { category: "ACOMPANHAMENTO" as const, name: "Salada Caprese", order: 3 },
        { category: "ACOMPANHAMENTO" as const, name: "Pães variados", order: 4 },
      ],
      gallery: [
        FAKE_IMAGE("mf-plus-1"),
        FAKE_IMAGE("mf-plus-2"),
        FAKE_IMAGE("mf-plus-3"),
        FAKE_IMAGE("mf-plus-4"),
      ],
    },
  ];

  for (const m of menus) {
    await prisma.menu.upsert({
      where: { slug: m.slug },
      create: {
        slug: m.slug,
        name: m.name,
        description: m.description,
        mainImageUrl: m.mainImageUrl,
        pricePerPerson: m.pricePerPerson,
        isActive: true,
        order: m.order,
        items: { create: m.items },
        galleryImages: {
          create: m.gallery.map((url, i) => ({ url, order: i })),
        },
      },
      update: {
        name: m.name,
        description: m.description,
        mainImageUrl: m.mainImageUrl,
        pricePerPerson: m.pricePerPerson,
        order: m.order,
        items: {
          deleteMany: {},
          create: m.items,
        },
        galleryImages: {
          deleteMany: {},
          create: m.gallery.map((url, i) => ({ url, order: i })),
        },
      },
    });
  }

  // Portfolio (algumas imagens fake)
  const portfolioCount = await prisma.portfolioImage.count();
  if (portfolioCount === 0) {
    await prisma.portfolioImage.createMany({
      data: [
        { url: FAKE_IMAGE("mf-port-1"), caption: "Confraternização corporativa", order: 0 },
        { url: FAKE_IMAGE("mf-port-2"), caption: "Casamento ao ar livre", order: 1 },
        { url: FAKE_IMAGE("mf-port-3"), caption: "Aniversário de 30 anos", order: 2 },
        { url: FAKE_IMAGE("mf-premium-3"), caption: "Almoço de família", order: 3 },
      ],
    });
  }

  console.log("Seed concluído com sucesso ✓");
  console.log(`  Admin: ${adminEmail}`);
  console.log(`  Menus: ${menus.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
