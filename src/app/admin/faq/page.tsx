import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaqForm, FaqRow } from "./faq-form";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const faqs = await prisma.faq.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Perguntas frequentes</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edite as perguntas que aparecem na home e na página /perguntas-frequentes.
          Para esconder a seção inteira do site, vá em Configurações &rarr; Seções da home.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar pergunta</CardTitle>
        </CardHeader>
        <CardContent>
          <FaqForm mode="create" />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Perguntas cadastradas ({faqs.length})
        </h2>
        {faqs.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhuma pergunta ainda. Use o formulário acima para começar.
          </p>
        ) : (
          <div className="space-y-3">
            {faqs.map((f) => (
              <FaqRow key={f.id} item={f} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
