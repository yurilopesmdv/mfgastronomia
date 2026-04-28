import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UsersManager } from "./users-manager";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const [session, users] = await Promise.all([
    auth(),
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, email: true, createdAt: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Usuários admin</h1>
      <UsersManager users={users} currentUserId={session?.user?.id ?? null} />
    </div>
  );
}
