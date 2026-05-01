import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TestimonialForm, TestimonialRow } from "./testimonial-form";

export const dynamic = "force-dynamic";

export default async function AdminTestimonialsPage() {
  const items = await prisma.testimonial.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Depoimentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Adicione comentários de clientes para mostrar na home. Para ocultar a seção
          inteira, vá em Configurações &rarr; Seções da home.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Adicionar depoimento</CardTitle>
        </CardHeader>
        <CardContent>
          <TestimonialForm mode="create" />
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Depoimentos cadastrados ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum depoimento ainda. Clique em &ldquo;Adicionar depoimento&rdquo; acima
            para começar.
          </p>
        ) : (
          <div className="space-y-3">
            {items.map((t) => (
              <TestimonialRow
                key={t.id}
                item={{
                  id: t.id,
                  authorName: t.authorName,
                  authorEvent: t.authorEvent,
                  quote: t.quote,
                  rating: t.rating,
                  photoUrl: t.photoUrl,
                  order: t.order,
                  isActive: t.isActive,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
