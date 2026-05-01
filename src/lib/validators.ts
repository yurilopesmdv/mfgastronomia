import { z } from "zod";

const phoneRegex = /^\+?\d[\d\s().-]{8,20}\d$/;

export const phoneSchema = z
  .string()
  .trim()
  .regex(phoneRegex, "Telefone inválido")
  .transform((v) => v.replace(/\D/g, ""));

export const nameSchema = z.string().trim().min(2, "Nome muito curto").max(100);

export const quickContactSchema = z.object({
  source: z.literal("QUICK_CONTACT"),
  name: nameSchema,
  phone: phoneSchema,
});

export const menuQuoteSchema = z.object({
  source: z.literal("MENU_QUOTE"),
  name: nameSchema,
  phone: phoneSchema,
  menuId: z.string().min(1),
  // mínimo absoluto pra evitar payloads abusivos; o mínimo "de negócio" por
  // cardápio é validado contra menu.minPeople no server.
  peopleCount: z.number().int().min(1).max(2000),
  waitersCount: z.number().int().min(1).max(3),
  eventDate: z.string().trim().min(1, "Data obrigatória").max(50),
  city: z.string().trim().min(2).max(100),
  neighborhood: z.string().trim().min(2).max(100),
  // IDs dos adicionais marcados pelo usuário. Validados contra MenuAddon
  // ativos do menu correto no servidor (zero confiança no cliente).
  selectedAddonIds: z.array(z.string().min(1)).max(50).optional(),
});

export const leadSchema = z.discriminatedUnion("source", [
  quickContactSchema,
  menuQuoteSchema,
]);

export type LeadInput = z.infer<typeof leadSchema>;

export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Senha obrigatória"),
});

export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .max(100);

export const createUserSchema = z.object({
  name: nameSchema,
  email: z.string().email(),
  password: passwordSchema,
});

export const menuItemSchema = z.object({
  category: z.enum(["APERITIVO", "CARNE", "ACOMPANHAMENTO"]),
  name: z.string().trim().min(1).max(120),
  order: z.number().int().min(0),
});

export const menuAddonSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z
    .union([z.literal(""), z.string().trim().max(500), z.null()])
    .transform((v) => (v ? v : null)),
  pricePerPerson: z.number().min(0, "Preço inválido"),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export const menuPriceTierSchema = z.object({
  minPeople: z
    .number({ message: "Informe a quantidade mínima" })
    .int()
    .min(1, "Mínimo 1 pessoa")
    .max(2000),
  pricePerPerson: z.number().positive("Informe um preço válido"),
  order: z.number().int().min(0),
});

export const menuSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "URL deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().trim().min(1).max(5000),
  mainImageUrl: z.string().url("URL inválida"),
  pricePerPerson: z.number().positive("Informe um preço válido"),
  minPeople: z.number().int().min(1).max(500),
  isActive: z.boolean(),
  order: z.number().int().min(0),
  items: z.array(menuItemSchema),
  galleryImages: z.array(
    z.object({ url: z.string().url(), order: z.number().int().min(0) }),
  ),
  addons: z.array(menuAddonSchema),
  priceTiers: z.array(menuPriceTierSchema),
});

export const portfolioImageSchema = z.object({
  url: z.string().url(),
  caption: z.string().trim().max(200).optional().nullable(),
  order: z.number().int().min(0),
});

// Helpers: aceita string vazia ou null (UI envia "") e normaliza p/ null.
const nullableUrl = z
  .union([z.literal(""), z.string().trim().url("URL inválida"), z.null()])
  .transform((v) => (v ? v : null));

const nullableEmail = z
  .union([z.literal(""), z.string().trim().email("E-mail inválido"), z.null()])
  .transform((v) => (v ? v : null));

const nullableString = (max = 200) =>
  z
    .union([z.literal(""), z.string().trim().max(max), z.null()])
    .transform((v) => (v ? v : null));

// Coordenada geográfica opcional. Aceita number (válido), NaN (input vazio) ou null.
const nullableCoordinate = z
  .union([z.number(), z.nan(), z.null()])
  .transform((v) => {
    if (v === null) return null;
    if (typeof v === "number" && Number.isFinite(v)) return v;
    return null;
  });

export const siteSettingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{12,15}$/, "Use formato E.164 sem '+', ex: 5541999999999"),
  defaultContactMessage: z.string().trim().min(5).max(500),
  heroTitle: z.string().trim().min(3).max(120),
  heroSubtitle: z.string().trim().min(3).max(300),
  aboutText: z.string().trim().min(3).max(5000),
  contactText: z.string().trim().min(3).max(1000),
  waiterAdditionalPrice: z.number().min(0),
  logoUrl: nullableUrl,
  logoUrlDark: nullableUrl,
  heroImageUrl: nullableUrl,
  aboutImageUrl: nullableUrl,
  ogImageUrl: nullableUrl,

  siteUrl: nullableUrl,
  email: nullableEmail,
  phoneFallback: nullableString(40),
  instagramHandle: nullableString(60),
  facebookUrl: nullableUrl,
  priceRange: nullableString(10),
  addressCity: nullableString(120),
  addressRegion: nullableString(120),
  addressStreet: nullableString(200),
  latitude: nullableCoordinate,
  longitude: nullableCoordinate,

  showFeatures: z.boolean(),
  showAbout: z.boolean(),
  showFeaturedMenus: z.boolean(),
  showHowItWorks: z.boolean(),
  showPortfolioPreview: z.boolean(),
  showFinalCta: z.boolean(),
  showFaq: z.boolean(),
  showTestimonials: z.boolean(),
  showServiceArea: z.boolean(),

  serviceAreaText: nullableString(2000),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;

// Tabelas editáveis
export const faqSchema = z.object({
  question: z.string().trim().min(3).max(300),
  answer: z.string().trim().min(3).max(5000),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export const testimonialSchema = z.object({
  authorName: z.string().trim().min(2).max(120),
  authorEvent: nullableString(160),
  quote: z.string().trim().min(5).max(1000),
  // Aceita number, NaN (input vazio com valueAsNumber) ou null. Normaliza p/ null.
  rating: z
    .union([z.number(), z.nan(), z.null()])
    .transform((v) => {
      if (v === null) return null;
      const n = typeof v === "number" && Number.isFinite(v) ? v : null;
      if (n === null || n < 1 || n > 5) return null;
      return Math.round(n);
    }),
  photoUrl: nullableUrl,
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export const homeFeatureSchema = z.object({
  title: z.string().trim().min(2).max(120),
  body: z.string().trim().min(2).max(800),
  order: z.number().int().min(0),
  isActive: z.boolean(),
});

export const homeStepSchema = homeFeatureSchema;
