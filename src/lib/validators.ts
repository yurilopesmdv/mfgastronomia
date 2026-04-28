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
  peopleCount: z.number().int().min(10, "Mínimo 10 pessoas").max(2000),
  waitersCount: z.number().int().min(1).max(3),
  eventDate: z.string().trim().min(1, "Data obrigatória").max(50),
  city: z.string().trim().min(2).max(100),
  neighborhood: z.string().trim().min(2).max(100),
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

export const menuSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras minúsculas, números e hífens"),
  description: z.string().trim().min(1).max(2000),
  mainImageUrl: z.string().url("URL inválida"),
  pricePerPerson: z.number().positive("Informe um preço válido"),
  isActive: z.boolean(),
  order: z.number().int().min(0),
  items: z.array(menuItemSchema),
  galleryImages: z.array(
    z.object({ url: z.string().url(), order: z.number().int().min(0) }),
  ),
});

export const portfolioImageSchema = z.object({
  url: z.string().url(),
  caption: z.string().trim().max(200).optional().nullable(),
  order: z.number().int().min(0),
});

export const siteSettingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{12,15}$/, "Use formato E.164 sem '+', ex: 5541999999999"),
  defaultContactMessage: z.string().trim().min(5).max(500),
  heroTitle: z.string().trim().min(3).max(120),
  heroSubtitle: z.string().trim().min(3).max(300),
  aboutText: z.string().trim().min(3).max(2000),
  contactText: z.string().trim().min(3).max(1000),
  waiterAdditionalPrice: z.number().min(0),
  logoUrl: z.string().url().nullable().optional(),
  heroImageUrl: z.string().url().nullable().optional(),
  aboutImageUrl: z.string().url().nullable().optional(),
});

export type SiteSettingsInput = z.infer<typeof siteSettingsSchema>;
