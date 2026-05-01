import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const FAKE_IMAGE = (seed: string) =>
  `https://picsum.photos/seed/${seed}/1600/1200`;

async function main() {
  // Site settings — só popula campos NOVOS na atualização (não sobrescreve
  // edições do cliente em campos existentes).
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
      serviceAreaText:
        "Atendemos Curitiba e região metropolitana. Taxa de deslocamento conforme distância.",
      addressCity: "Curitiba",
      priceRange: "$$",
    },
    update: {},
  });

  // Home features (idempotente — só cria se não existir nada)
  const featuresCount = await prisma.homeFeature.count();
  if (featuresCount === 0) {
    await prisma.homeFeature.createMany({
      data: [
        {
          title: "Estrutura completa",
          body:
            "Levamos tudo: churrasqueira, mesas, utensílios e equipe pronta para o seu evento.",
          order: 0,
        },
        {
          title: "Cortes selecionados",
          body:
            "Carnes nobres acompanhadas de aperitivos e guarnições preparadas no momento.",
          order: 1,
        },
        {
          title: "Atendimento dedicado",
          body:
            "Da consulta inicial ao último prato — equipe atenta, atenciosa e à serviço da sua festa.",
          order: 2,
        },
      ],
    });
  }

  // Home steps (Como funciona)
  const stepsCount = await prisma.homeStep.count();
  if (stepsCount === 0) {
    await prisma.homeStep.createMany({
      data: [
        {
          title: "Conte sobre o evento",
          body:
            "Pelo WhatsApp, você nos passa a data, número de convidados e o estilo da festa.",
          order: 0,
        },
        {
          title: "Escolha o cardápio",
          body:
            "Sugerimos a opção ideal para o seu perfil. Você ajusta itens e fechamos o orçamento.",
          order: 1,
        },
        {
          title: "Aproveite o dia",
          body:
            "Chegamos antes, montamos tudo, servimos e deixamos o local impecável ao final.",
          order: 2,
        },
      ],
    });
  }

  // FAQs iniciais
  const faqCount = await prisma.faq.count();
  if (faqCount === 0) {
    await prisma.faq.createMany({
      data: [
        {
          question: "Qual a antecedência mínima para reservar?",
          answer:
            "Recomendamos 30 dias de antecedência. Em datas de alta procura (dezembro, junho/julho), o quanto antes melhor.",
          order: 0,
        },
        {
          question: "Quais cidades vocês atendem?",
          answer:
            "Curitiba e região metropolitana. Taxa de deslocamento conforme distância.",
          order: 1,
        },
        {
          question: "O que está incluso no preço por pessoa?",
          answer:
            "Aperitivos, carnes do cardápio, acompanhamentos, equipe de atendimento, churrasqueira e utensílios. Bebidas e mobiliário não estão inclusos por padrão.",
          order: 2,
        },
        {
          question: "Vocês fornecem mesas, cadeiras e talheres?",
          answer:
            "Trabalhamos com parceiros de confiança para locação de mobiliário. Podemos cuidar disso pra você ou somar ao orçamento.",
          order: 3,
        },
        {
          question: "Como funciona o pagamento?",
          answer:
            "Sinal de 30% no fechamento e o restante em até 7 dias antes do evento. Aceitamos PIX e transferência.",
          order: 4,
        },
        {
          question: "E se chover no evento?",
          answer:
            "Quando o evento é em espaço aberto, alinhamos plano B com você. Nossa equipe está preparada para montar em ambientes cobertos.",
          order: 5,
        },
        {
          question: "Há cardápio vegetariano ou opções para restrições alimentares?",
          answer:
            "Sim. Podemos personalizar o cardápio com opções vegetarianas, veganas e sem glúten. Avise no orçamento.",
          order: 6,
        },
        {
          question: "Qual o número mínimo de convidados?",
          answer:
            "Em geral, atendemos a partir de 10 pessoas, mas cada cardápio pode ter o seu próprio mínimo.",
          order: 7,
        },
      ],
    });
  }

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
