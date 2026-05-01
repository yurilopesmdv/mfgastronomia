-- CreateTable
CREATE TABLE "MenuPriceTier" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "minPeople" INTEGER NOT NULL,
    "pricePerPerson" DECIMAL(10,2) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuPriceTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MenuPriceTier_menuId_idx" ON "MenuPriceTier"("menuId");

-- CreateIndex
CREATE UNIQUE INDEX "MenuPriceTier_menuId_minPeople_key" ON "MenuPriceTier"("menuId", "minPeople");

-- AddForeignKey
ALTER TABLE "MenuPriceTier" ADD CONSTRAINT "MenuPriceTier_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;
