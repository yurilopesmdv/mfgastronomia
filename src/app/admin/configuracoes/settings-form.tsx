"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { siteSettingsSchema } from "@/lib/validators";
import { updateSiteSettings } from "./actions";

type Values = z.infer<typeof siteSettingsSchema>;

export function SettingsForm({ initial }: { initial: Values }) {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: initial,
  });

  const logoUrl = watch("logoUrl") ?? "";
  const heroImageUrl = watch("heroImageUrl") ?? "";
  const aboutImageUrl = watch("aboutImageUrl") ?? "";

  function onSubmit(values: Values) {
    startTransition(async () => {
      const res = await updateSiteSettings(values);
      if (!res.ok) {
        toast.error(res.error ?? "Falha ao salvar");
        return;
      }
      toast.success("Configurações atualizadas");
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
            value={logoUrl}
            onChange={(url) => setValue("logoUrl", url || null)}
            label="Logo (opcional, formato horizontal de preferência)"
          />
          <ImageUploader
            value={heroImageUrl}
            onChange={(url) => setValue("heroImageUrl", url || null)}
            label="Imagem do hero (capa da home — horizontal, alta resolução)"
          />
          <ImageUploader
            value={aboutImageUrl}
            onChange={(url) => setValue("aboutImageUrl", url || null)}
            label='Imagem da seção "Sobre" (vertical 3:4 fica melhor)'
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Textos do site</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="heroTitle">Título do hero</Label>
            <Input id="heroTitle" {...register("heroTitle")} />
            {errors.heroTitle && (
              <p className="text-sm text-destructive">{errors.heroTitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="heroSubtitle">Subtítulo do hero</Label>
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
            <Label htmlFor="contactText">Texto da seção &quot;Contato&quot;</Label>
            <Textarea id="contactText" rows={3} {...register("contactText")} />
            {errors.contactText && (
              <p className="text-sm text-destructive">
                {errors.contactText.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contato e preços</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="whatsappNumber">
              Número do WhatsApp (E.164 sem +)
            </Label>
            <Input
              id="whatsappNumber"
              placeholder="5541999999999"
              {...register("whatsappNumber")}
            />
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
            {errors.defaultContactMessage && (
              <p className="text-sm text-destructive">
                {errors.defaultContactMessage.message}
              </p>
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

      <Button type="submit" disabled={pending}>
        {pending ? "Salvando..." : "Salvar configurações"}
      </Button>
    </form>
  );
}
