-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "addressRegion" TEXT,
ADD COLUMN     "addressStreet" TEXT,
ADD COLUMN     "latitude" DECIMAL(10,7),
ADD COLUMN     "logoUrlDark" TEXT,
ADD COLUMN     "longitude" DECIMAL(10,7);
