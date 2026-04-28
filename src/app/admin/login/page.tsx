import { LoginForm } from "./login-form";

export const metadata = {
  title: "Login admin",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">MF Gastronomia</h1>
          <p className="mt-1 text-sm text-muted-foreground">Painel administrativo</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
