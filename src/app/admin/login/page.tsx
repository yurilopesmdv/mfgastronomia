import Image from "next/image";
import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/site-settings";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Acessar painel",
  description: "Acesso restrito ao painel administrativo da MF Gastronomia.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const settings = await getSiteSettings();

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          {settings.logoUrl ? (
            <div className="mx-auto h-12 w-auto inline-flex items-center justify-center">
              <Image
                src={settings.logoUrl}
                alt="MF Gastronomia"
                width={180}
                height={60}
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
          ) : (
            <p className="font-heading text-xl tracking-tight text-muted-foreground">
              MF Gastronomia
            </p>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">Acessar painel</h1>
          <p className="text-sm text-muted-foreground">
            Entre com seu e-mail e senha para gerenciar o site.
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
