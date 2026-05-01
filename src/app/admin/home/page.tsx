import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeItemForm, HomeItemRow } from "./item-form";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [features, steps] = await Promise.all([
    prisma.homeFeature.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
    prisma.homeStep.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Conteúdo da página inicial
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Edite os blocos de &ldquo;Diferenciais&rdquo; e os passos de &ldquo;Como
          funciona&rdquo;. Para esconder a seção inteira, vá em Configurações &rarr;
          Seções da home.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Diferenciais</h2>
        <Card>
          <CardHeader>
            <CardTitle>Adicionar diferencial</CardTitle>
          </CardHeader>
          <CardContent>
            <HomeItemForm kind="feature" mode="create" />
          </CardContent>
        </Card>
        {features.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum diferencial cadastrado.
          </p>
        ) : (
          <div className="space-y-3">
            {features.map((f) => (
              <HomeItemRow
                key={f.id}
                kind="feature"
                item={{
                  id: f.id,
                  title: f.title,
                  body: f.body,
                  order: f.order,
                  isActive: f.isActive,
                }}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Como funciona (passos)
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Adicionar passo</CardTitle>
          </CardHeader>
          <CardContent>
            <HomeItemForm kind="step" mode="create" />
          </CardContent>
        </Card>
        {steps.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum passo cadastrado.</p>
        ) : (
          <div className="space-y-3">
            {steps.map((s) => (
              <HomeItemRow
                key={s.id}
                kind="step"
                item={{
                  id: s.id,
                  title: s.title,
                  body: s.body,
                  order: s.order,
                  isActive: s.isActive,
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
