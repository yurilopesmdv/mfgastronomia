"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { siteSettingsSchema } from "@/lib/validators";
import { useSavedFeedback } from "@/lib/hooks/useSavedFeedback";
import { updateSiteSettings } from "./actions";

// Input = tipo dos campos (o que aparece no form). Output = depois das transformações do zod.
type FormIn = z.input<typeof siteSettingsSchema>;
type FormOut = z.output<typeof siteSettingsSchema>;

const SECTION_TOGGLES: Array<{
  key:
    | "showFeatures"
    | "showAbout"
    | "showServiceArea"
    | "showFeaturedMenus"
    | "showHowItWorks"
    | "showTestimonials"
    | "showPortfolioPreview"
    | "showFaq"
    | "showFinalCta";
  label: string;
  hint: string;
}> = [
  { key: "showFeatures", label: "Diferenciais", hint: "Bloco de 3 cards no topo" },
  { key: "showAbout", label: "Sobre nós", hint: "Texto + imagem da seção sobre" },
  { key: "showServiceArea", label: "Onde atendemos", hint: "Faixa com cidades/região" },
  { key: "showFeaturedMenus", label: "Cardápios em destaque", hint: "Os 3 primeiros cardápios" },
  { key: "showHowItWorks", label: "Como funciona", hint: "Os passos do processo" },
  { key: "showTestimonials", label: "Depoimentos", hint: "Carrossel de comentários" },
  { key: "showPortfolioPreview", label: "Portfólio (prévia)", hint: "Grid com fotos de eventos" },
  { key: "showFaq", label: "Perguntas frequentes", hint: "Lista accordion de perguntas" },
  { key: "showFinalCta", label: "Convite final", hint: "Bloco grande com botão de contato" },
];

export function SettingsForm({ initial }: { initial: FormIn }) {
  const [pending, startTransition] = useTransition();
  const { saved, markSaved } = useSavedFeedback();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormIn, unknown, FormOut>({
    // zodResolver aceita schemas com transform; o 3º generic do useForm
    // recebe o tipo do output que vai para onSubmit.
    resolver: zodResolver(siteSettingsSchema) as never,
    defaultValues: initial,
  });

  const logoUrl = watch("logoUrl") ?? "";
  const logoUrlDark = watch("logoUrlDark") ?? "";
  const heroImageUrl = watch("heroImageUrl") ?? "";
  const aboutImageUrl = watch("aboutImageUrl") ?? "";
  const ogImageUrl = watch("ogImageUrl") ?? "";

  function onSubmit(values: FormOut) {
    startTransition(async () => {
      const res = await updateSiteSettings(values);
      if (!res.ok) {
        toast.error(res.error ?? "Falha ao salvar");
        return;
      }
      toast.success("Configurações atualizadas");
      markSaved();
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>Imagens da marca</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <ImageUploader
            value={logoUrl ?? ""}
            onChange={(url) => setValue("logoUrl", url || null)}
            label="Logo (opcional, formato horizontal de preferência)"
          />
          <ImageUploader
            value={logoUrlDark ?? ""}
            onChange={(url) => setValue("logoUrlDark", url || null)}
            label="Logo para fundo escuro (versão branca/clara, opcional). Aparece no rodapé do site."
          />
          <ImageUploader
            value={heroImageUrl ?? ""}
            onChange={(url) => setValue("heroImageUrl", url || null)}
            label="Imagem do hero (capa da home — horizontal, alta resolução)"
          />
          <ImageUploader
            value={aboutImageUrl ?? ""}
            onChange={(url) => setValue("aboutImageUrl", url || null)}
            label='Imagem da seção "Sobre" (vertical 3:4 fica melhor)'
          />
          <ImageUploader
            value={ogImageUrl ?? ""}
            onChange={(url) => setValue("ogImageUrl", url || null)}
            label="Imagem para compartilhamento (1200×630, aparece no WhatsApp/Instagram)"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Textos do site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">Título do hero (frase grande na home)</Label>
            <Input id="heroTitle" {...register("heroTitle")} />
            {errors.heroTitle && (
              <p className="text-sm text-destructive">{errors.heroTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Subtítulo do hero (frase de apoio)</Label>
            <Textarea id="heroSubtitle" rows={2} {...register("heroSubtitle")} />
            {errors.heroSubtitle && (
              <p className="text-sm text-destructive">
                {errors.heroSubtitle.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="aboutText">Texto da seção &quot;Sobre&quot;</Label>
            <Textarea id="aboutText" rows={5} {...register("aboutText")} />
            {errors.aboutText && (
              <p className="text-sm text-destructive">{errors.aboutText.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactText">Texto do convite final</Label>
            <Textarea id="contactText" rows={3} {...register("contactText")} />
            {errors.contactText && (
              <p className="text-sm text-destructive">
                {errors.contactText.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="serviceAreaText">Onde atendemos (área de atendimento)</Label>
            <Textarea
              id="serviceAreaText"
              rows={3}
              placeholder="Atendemos Curitiba e região metropolitana. Taxa de deslocamento conforme distância."
              {...register("serviceAreaText")}
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco para esconder a seção.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seções da home</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Marque as seções que devem aparecer no site. Desmarcadas ficam ocultas.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {SECTION_TOGGLES.map((t) => (
              <label
                key={t.key}
                className="flex items-start gap-3 rounded-md border border-border p-3 cursor-pointer hover:bg-muted/40"
              >
                <input
                  type="checkbox"
                  className="size-4 mt-0.5"
                  {...register(t.key)}
                />
                <div>
                  <div className="text-sm font-medium">{t.label}</div>
                  <div className="text-xs text-muted-foreground">{t.hint}</div>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato e redes sociais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">
              Número do WhatsApp (formato 5541999999999)
            </Label>
            <Input
              id="whatsappNumber"
              placeholder="5541999999999"
              {...register("whatsappNumber")}
            />
            <p className="text-xs text-muted-foreground">
              Coloque o DDI 55 + DDD + número, sem espaços ou símbolos.
            </p>
            {errors.whatsappNumber && (
              <p className="text-sm text-destructive">
                {errors.whatsappNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultContactMessage">
              Mensagem padrão do contato rápido
            </Label>
            <Textarea
              id="defaultContactMessage"
              rows={3}
              {...register("defaultContactMessage")}
            />
            <p className="text-xs text-muted-foreground">
              Texto que abre no WhatsApp quando o cliente clica em &quot;Fale conosco&quot;.
            </p>
            {errors.defaultContactMessage && (
              <p className="text-sm text-destructive">
                {errors.defaultContactMessage.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail comercial (opcional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="contato@mfgastronomia.com.br"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneFallback">Telefone fixo (opcional)</Label>
              <Input
                id="phoneFallback"
                placeholder="+55 41 3333-4444"
                {...register("phoneFallback")}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagramHandle">Instagram (sem o @)</Label>
              <Input
                id="instagramHandle"
                placeholder="mfgastronomia"
                {...register("instagramHandle")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="facebookUrl">URL do Facebook (opcional)</Label>
              <Input
                id="facebookUrl"
                placeholder="https://facebook.com/mfgastronomia"
                {...register("facebookUrl")}
              />
              {errors.facebookUrl && (
                <p className="text-sm text-destructive">
                  {errors.facebookUrl.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endereço, preços e SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="addressCity">Cidade-base (para o Google)</Label>
              <Input
                id="addressCity"
                placeholder="Curitiba"
                {...register("addressCity")}
              />
              <p className="text-xs text-muted-foreground">
                Ajuda no Google a identificar a região onde você atua.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="addressRegion">Estado / UF (opcional)</Label>
              <Input
                id="addressRegion"
                placeholder="PR"
                {...register("addressRegion")}
              />
              <p className="text-xs text-muted-foreground">
                Ex: PR, SP, RS. Aparece no Google como sua região.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressStreet">Endereço (rua, número — opcional)</Label>
            <Input
              id="addressStreet"
              placeholder="Rua Exemplo, 123 - Bairro"
              {...register("addressStreet")}
            />
            <p className="text-xs text-muted-foreground">
              Use apenas se tiver um endereço fixo. Eventos no local do cliente
              não precisam.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude (opcional)</Label>
              <Input
                id="latitude"
                type="number"
                step="0.0000001"
                placeholder="-25.4284"
                {...register("latitude", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude (opcional)</Label>
              <Input
                id="longitude"
                type="number"
                step="0.0000001"
                placeholder="-49.2733"
                {...register("longitude", { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priceRange">Faixa de preço (para o Google)</Label>
              <Input
                id="priceRange"
                placeholder="$$"
                {...register("priceRange")}
              />
              <p className="text-xs text-muted-foreground">
                Ex: $, $$, $$$.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteUrl">URL pública do site (opcional)</Label>
            <Input
              id="siteUrl"
              placeholder="https://mfgastronomia.com.br"
              {...register("siteUrl")}
            />
            <p className="text-xs text-muted-foreground">
              Deixe em branco que o sistema usa o domínio configurado no servidor.
            </p>
            {errors.siteUrl && (
              <p className="text-sm text-destructive">{errors.siteUrl.message}</p>
            )}
          </div>

          <div className="space-y-2 max-w-xs">
            <Label htmlFor="waiterAdditionalPrice">
              Preço por garçom adicional (R$)
            </Label>
            <Input
              id="waiterAdditionalPrice"
              type="number"
              step="0.01"
              {...register("waiterAdditionalPrice", { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              1º garçom incluso. Adicionais cobram este valor cada.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={pending || saved} size="lg">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" /> Salvando...
          </>
        ) : saved ? (
          <>
            <Check className="size-4" /> Salvo
          </>
        ) : (
          "Salvar configurações"
        )}
      </Button>
    </form>
  );
}
