# MF Gastronomia

Site institucional + painel administrativo para uma empresa de buffet de churrasco que atende eventos no local do cliente. O diferencial é o **cálculo de orçamento em tempo real**: o visitante seleciona um cardápio, ajusta a quantidade de pessoas e garçons, vê o total se atualizar na tela e é redirecionado direto para o WhatsApp da empresa com a mensagem já formatada.

O painel admin permite ao cliente final editar cardápios, fotos, textos do site e número do WhatsApp sem precisar de deploy. Uploads passam pelo Cloudinary (signed URL gerada no servidor — `api_secret` nunca chega ao browser).

---

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilo | Tailwind CSS v4 (config via CSS) + shadcn/ui (base-ui/react) |
| Banco | PostgreSQL serverless (Neon) |
| ORM | Prisma 6 |
| Auth | Auth.js v5 (Credentials Provider + bcrypt + JWT em cookie httpOnly) |
| Validação | Zod (cliente e servidor) |
| Imagens | Cloudinary (signed upload + `next/image` com remotePatterns) |
| Forms | React Hook Form + `@hookform/resolvers` |
| Toasts | Sonner |
| Deploy | Vercel |

Tipografia: **Fraunces** (serif editorial para títulos) + **Inter** (sans para corpo), via `next/font/google`.
Paleta: creme + carvão + terracota — sem dark mode (decisão consciente para um site institucional de gastronomia).

---

## Funcionalidades

### Site público

- **Home** com hero full-bleed (`min-h-100svh`), sobre + foto, cardápios em destaque, "como funciona" (3 passos), preview de portfólio e CTA final
- **Listagem de cardápios** (`/cardapios`) e **página de detalhe** (`/cardapios/[slug]`) com:
  - Hero próprio com foto principal
  - Itens agrupados por categoria (Aperitivos / Carnes / Acompanhamentos)
  - Galeria de fotos
  - Formulário de orçamento sticky no desktop com **cálculo em tempo real** e slider de garçons (1–3)
- **Portfólio** (`/portfolio`) em grid masonry (cada 5ª foto ocupa 2x2)
- **Botão flutuante WhatsApp** verde no canto inferior direito (mobile-first)
- **Animações de scroll-reveal** (fade + translate-y) via Intersection Observer puro, sem libs
- **Header transparente** sobre o hero da home, opaco com `backdrop-blur` ao rolar
- ISR com `revalidate = 60` em todas as páginas públicas

### Painel admin (`/admin/*`)

Tudo protegido por middleware (`proxy.ts` no Next 16) que redireciona não-autenticados para `/admin/login`.

- **Login** com Credentials (email + senha bcrypt) e session JWT
- **Dashboard** com contadores (cardápios, portfolio, leads) e últimos 10 leads
- **CRUD de cardápios** com items dinâmicos (RHF `useFieldArray`), galeria de imagens, slug auto-sugerido a partir do nome, status ativo/inativo
- **Gerenciador de portfólio** (upload + legenda + ordem)
- **Configurações do site**: imagens (logo, hero, sobre), textos (hero/sobre/contato), número do WhatsApp, mensagem padrão, preço por garçom adicional
- **Gestão de usuários admin** (criar, deletar — protege a última conta e a própria)
- **Lista de leads** capturados (apenas leads de orçamento de cardápio, com cálculo persistido)

---

## Destaques técnicos

### Cálculo de orçamento com validação no servidor

O formulário calcula o total no cliente para UX imediata, mas a API **recalcula com o preço do banco** antes de salvar o lead. Isso impede que o usuário forje o `calculatedTotal` no payload — o servidor é a fonte de verdade.

```ts
// src/app/api/lead/route.ts
const menu = await prisma.menu.findUnique({ where: { id: data.menuId } });
const calculatedTotal = calculateMenuTotal({
  pricePerPerson: Number(menu.pricePerPerson), // do banco, não do cliente
  peopleCount: data.peopleCount,
  waitersCount: data.waitersCount,
  waiterAdditionalPrice: Number(settings.waiterAdditionalPrice),
});
```

### Auth.js v5 com config dividida (edge vs node)

O `proxy.ts` (renomeado de `middleware.ts` no Next 16) precisa rodar em runtime edge, mas Prisma + bcrypt não rodam em edge. A solução é o **split config pattern** recomendado pela Auth.js:

- `src/lib/auth.config.ts` — só callbacks e pages (edge-safe, sem imports de DB)
- `src/lib/auth.ts` — spread do auth.config + Credentials provider com Prisma e bcrypt
- `src/proxy.ts` — importa só o `auth.config`

```ts
// src/proxy.ts (edge runtime)
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;
export const config = { matcher: ["/admin/:path*"] };
```

### Upload de imagem com signed URL (Cloudinary)

O browser nunca vê o `CLOUDINARY_API_SECRET`. Fluxo:

1. Cliente clica em "Escolher imagem"
2. Frontend chama `POST /api/upload` (autenticada) — servidor gera HMAC signature com timestamp + folder e devolve `{ apiKey, timestamp, signature, cloudName, folder }`
3. Frontend faz upload **direto para Cloudinary** com esses parâmetros (`multipart/form-data`)
4. Cloudinary devolve `secure_url`, que é salvo no DB

A imagem nem trafega pelo servidor da aplicação — economia de bandwidth e CPU.

### Transações de update para items + galeria

Editar um cardápio com items e galeria envolve manter consistência entre 3 tabelas. O update é uma **transação Prisma**:

```ts
await prisma.$transaction([
  prisma.menu.update({ where: { id }, data: rest }),
  prisma.menuItem.deleteMany({ where: { menuId: id } }),
  prisma.menuGalleryImage.deleteMany({ where: { menuId: id } }),
  prisma.menuItem.createMany({ data: items.map(i => ({ ...i, menuId: id })) }),
  prisma.menuGalleryImage.createMany({ data: galleryImages.map(g => ({ ...g, menuId: id })) }),
]);
```

### Singleton `SiteSettings`

O modelo `SiteSettings` tem `id String @id @default("default")` — sempre uma única linha. O helper `getSiteSettings()` faz `findUnique` e cai num `create` com defaults se não existir, dispensando seed manual em ambientes novos.

### Server Actions + `revalidatePath`

Mutações no admin usam Server Actions (não API routes), e cada uma invalida as páginas públicas afetadas:

```ts
revalidatePath("/admin/cardapios");
revalidatePath("/cardapios");
revalidatePath("/");
```

A página pública atualiza no próximo request, sem precisar esperar os 60s do ISR.

### Animações sem dependências

`IntersectionObserver` puro, dispara uma vez (observer disconnects no primeiro hit), com transição CSS pré-definida em `globals.css`:

```css
.fade-in-init { opacity: 0; transform: translateY(20px); transition: opacity 0.7s, transform 0.7s; }
.fade-in-visible { opacity: 1; transform: translateY(0); }
```

Componente `<FadeIn>` aplica `fade-in-init` sempre e `fade-in-visible` quando entra no viewport. Suporta `delay` para staggered entries.

### Tipografia fluida

Títulos usam `clamp()` para escalar suavemente entre mobile e desktop sem media queries:

```tsx
<h1 className="font-heading text-[clamp(2.5rem,7vw,5.5rem)] leading-[1.05]">
```

### Tailwind v4 com tokens via CSS

Tailwind v4 deprecou `tailwind.config.js` em favor de `@theme inline` em CSS. Os tokens (cores, fontes, raios) ficam em `globals.css` como CSS variables, e o Tailwind gera classes a partir deles:

```css
@theme inline {
  --color-primary: var(--primary);
  --font-heading: var(--font-heading);
}
:root {
  --primary: oklch(0.55 0.14 40);
  --font-heading: var(--font-heading); /* set by next/font */
}
```

---

## Modelo de dados

```
User              ── login admin (bcrypt password hash)
SiteSettings      ── singleton com textos, imagens (logo/hero/sobre), WhatsApp, preço de garçom
Menu              ── slug único, foto principal, preço por pessoa, status ativo
  ├─ MenuItem            ── nome + categoria (APERITIVO|CARNE|ACOMPANHAMENTO) + ordem
  └─ MenuGalleryImage    ── URLs de fotos extras
PortfolioImage    ── galeria de eventos realizados
Lead              ── captura de orçamento (source MENU_QUOTE) ou contato rápido
```

Schema completo em [`prisma/schema.prisma`](prisma/schema.prisma).

---

## Estrutura de pastas

```
mfgastronomia/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts                       # admin + 3 cardápios + portfólio + settings
├── src/
│   ├── app/
│   │   ├── (public)/                 # route group sem prefixo na URL
│   │   │   ├── layout.tsx            # header + footer + WhatsApp flutuante
│   │   │   ├── page.tsx              # home
│   │   │   ├── cardapios/page.tsx
│   │   │   ├── cardapios/[slug]/page.tsx
│   │   │   └── portfolio/page.tsx
│   │   ├── admin/                    # protegido por proxy.ts
│   │   │   ├── login/
│   │   │   ├── cardapios/            # list + novo + [id]/edit + actions.ts
│   │   │   ├── portfolio/
│   │   │   ├── configuracoes/
│   │   │   ├── usuarios/
│   │   │   └── leads/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/   # handlers do Auth.js
│   │   │   ├── lead/                 # POST cria lead + retorna wa.me URL
│   │   │   └── upload/               # POST gera signed params do Cloudinary
│   │   ├── layout.tsx                # root layout (fontes + Toaster)
│   │   └── globals.css               # tokens, paleta, animações
│   ├── components/
│   │   ├── ui/                       # shadcn (base-ui/react)
│   │   ├── public/                   # Header, Footer, Hero, MenuCard, ...
│   │   └── admin/                    # Sidebar, ImageUploader, SignOutButton
│   ├── lib/
│   │   ├── prisma.ts                 # singleton client
│   │   ├── auth.ts / auth.config.ts  # Auth.js split-config
│   │   ├── validators.ts             # schemas Zod
│   │   ├── whatsapp.ts               # buildWhatsappUrl, formatBRL, calculateMenuTotal
│   │   ├── cloudinary.ts             # signed upload helper
│   │   ├── site-settings.ts          # getSiteSettings (singleton)
│   │   └── ratelimit.ts              # stub no-op (Upstash post-MVP)
│   ├── types/next-auth.d.ts          # augmenta Session.user.id
│   └── proxy.ts                      # middleware (renomeado no Next 16)
├── next.config.ts
├── tsconfig.json
└── package.json
```

---

## Como rodar localmente

### Pré-requisitos

- **Node.js 24** (qualquer versão LTS recente serve, mas o projeto fixa `24` em `.nvmrc`)
- Conta gratuita no [Neon](https://neon.tech) (Postgres serverless)
- Conta gratuita no [Cloudinary](https://cloudinary.com) (uploads de imagem)

### 1. Clone e instale

```bash
git clone git@github.com:yurilopesmdv/mfgastronomia.git
cd mfgastronomia
nvm use            # respeita .nvmrc → Node 24
npm install
```

### 2. Configure as variáveis de ambiente

Copie o template e preencha com seus valores:

```bash
cp .env.example .env
```

Variáveis obrigatórias:

| Variável | Onde pegar |
|---|---|
| `DATABASE_URL` | Neon dashboard → Connection Details → string com `-pooler` no host |
| `DIRECT_URL` | Neon dashboard → mesma página, string sem `-pooler` (usada por `prisma migrate`) |
| `AUTH_SECRET` | Gere com `openssl rand -base64 32` |
| `AUTH_URL` | `http://localhost:3000` em dev |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard → Product Environment Credentials |
| `CLOUDINARY_API_KEY` | mesma página |
| `CLOUDINARY_API_SECRET` | mesma página (clique no olhinho para revelar) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | igual ao `CLOUDINARY_CLOUD_NAME` |
| `SEED_ADMIN_EMAIL` | email do admin que será criado pelo seed |
| `SEED_ADMIN_PASSWORD` | senha inicial (mín. 8 caracteres) |
| `SEED_ADMIN_NAME` | nome do admin |

### 3. Banco de dados

```bash
npx prisma migrate dev    # cria as tabelas no Neon
npx prisma db seed        # popula admin + 3 cardápios fake + portfólio + settings
```

### 4. Suba o dev server

```bash
npm run dev
```

Abra **http://localhost:3000**.

Para entrar no painel admin, vá em **http://localhost:3000/admin/login** e use o email/senha definidos em `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`.

---

## Scripts

```bash
npm run dev          # dev server (Turbopack)
npm run build        # prisma generate + next build (usado pela Vercel)
npm run start        # serve o build de produção
npm run lint         # ESLint
npm run db:migrate   # prisma migrate dev
npm run db:seed      # prisma db seed
npm run db:studio    # abre o Prisma Studio para inspecionar o banco
```

---

## Deploy

O projeto está pronto para deploy na **Vercel**:

1. Importe o repositório em https://vercel.com/new
2. Adicione todas as variáveis de ambiente do `.env` no painel da Vercel (mesmas do passo 2 do setup local)
3. Adicione **`AUTH_TRUST_HOST=true`** (necessário para Auth.js v5 atrás do proxy da Vercel)
4. Não precisa setar `AUTH_URL` — Auth.js v5 detecta automaticamente
5. Clique em "Deploy" — o build roda `prisma generate && next build`, conecta no Neon para pré-renderizar páginas estáticas e sobe

Para domínio customizado: Project Settings → Domains → adiciona, segue as instruções de DNS, HTTPS sai automático.

---

## Roadmap pós-MVP

- [ ] Rate limit em `/api/lead` (Upstash via Vercel Marketplace)
- [ ] SEO completo: `sitemap.xml`, `robots.txt`, `og-image`, JSON-LD `LocalBusiness`
- [ ] Notificação por email para o admin quando chega lead (Resend)
- [ ] Filtros e exportação CSV em `/admin/leads`
- [ ] Múltiplos idiomas (apenas se o cliente expandir)
- [ ] Dashboard analytics básico (leads por mês, conversão por cardápio)

---

## Plano de implementação

Documento técnico com escopo, decisões de arquitetura, modelo de dados e ordem de execução do MVP: [`PLANO_MF_GASTRONOMIA.md`](PLANO_MF_GASTRONOMIA.md).

---

## Autor

**Yuri Lopes** — yuri.lopes@agrisafe.agr.br

Projeto desenvolvido como caso real de cliente. Sinta-se à vontade para abrir issues, sugerir melhorias ou usar o código como referência.
