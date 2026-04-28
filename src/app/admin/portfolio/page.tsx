import { prisma } from "@/lib/prisma";
import { PortfolioManager } from "./portfolio-manager";

export const dynamic = "force-dynamic";

export default async function AdminPortfolioPage() {
  const images = await prisma.portfolioImage.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <h1 className="text-2xl font-semibold tracking-tight">Portfólio</h1>
      <PortfolioManager images={images} />
    </div>
  );
}
