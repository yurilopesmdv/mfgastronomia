import { MenuForm } from "../menu-form";

export default function NewMenuPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight">Novo cardápio</h1>
      <MenuForm mode="create" />
    </div>
  );
}
