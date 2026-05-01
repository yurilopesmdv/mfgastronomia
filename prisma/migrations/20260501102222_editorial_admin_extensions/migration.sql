-- AlterTable
ALTER TABLE "Menu" ADD COLUMN     "minPeople" INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "addressCity" TEXT,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramHandle" TEXT,
ADD COLUMN     "ogImageUrl" TEXT,
ADD COLUMN     "phoneFallback" TEXT,
ADD COLUMN     "priceRange" TEXT,
ADD COLUMN     "serviceAreaText" TEXT,
ADD COLUMN     "showAbout" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showFaq" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showFeaturedMenus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showFeatures" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showFinalCta" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showHowItWorks" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showPortfolioPreview" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showServiceArea" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "showTestimonials" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "siteUrl" TEXT;

-- CreateTable
CREATE TABLE "HomeFeature" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeStep" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "authorEvent" TEXT,
    "quote" TEXT NOT NULL,
    "rating" INTEGER,
    "photoUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);
