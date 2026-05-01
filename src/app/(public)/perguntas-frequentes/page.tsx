import { FaqSection } from "@/components/public/FaqSection";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export const metadata = {
  title: "Perguntas frequentes",
  description:
    "Tire suas dúvidas sobre o buffet de churrasco da MF Gastronomia: cardápios, atendimento, antecedência, pagamento e mais.",
  alternates: { canonical: "/perguntas-frequentes" },
};

export default async function PerguntasFrequentesPage() {
  const faqs = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  // JSON-LD FAQPage para o Google
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="pt-32 pb-16">
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <div className="container mx-auto px-4 mb-10 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.25em] text-primary mb-4">
          FAQ
        </p>
        <h1 className="font-heading text-5xl md:text-6xl tracking-tight leading-[1.05]">
          Perguntas frequentes
        </h1>
      </div>
      <FaqSection faqs={faqs} />
    </div>
  );
}
