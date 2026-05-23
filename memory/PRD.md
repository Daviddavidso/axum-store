# AXUM — Product Requirements Document

## Original problem statement
High-end fashion e-commerce storefront landing page, brutalist/minimalist aesthetic, strict full-width grid with thin black borders, white background, bold sans-serif headings, monotone palette. Site name: AXUM. Required: dual-image cross-fade product hover (0.4s, ease-in-out), full-screen hero slider with horizontal slide + Ken Burns, right-slide overlay nav, lookbook with fade transitions on category change, inverted-color button hovers.

### Phase 2 — Bilingual (2025-12)
Add RU/EN with same domain, /en and /ru routing, language toggle, independently managed RU and EN content (name, description, price, category) for products + localized hero + lookbook. Admin panel via Emergent Google OAuth (allowlist normuloli@gmail.com). RU price computed from USD * 72 * 0.95, override-able in admin.

## Architecture
- Backend: FastAPI + Motor (MongoDB) under `/api` prefix. Bilingual documents (`*_en`, `*_ru`). Auto-seeds 8 products / 3 hero / 4 lookbook on startup if missing.
- Frontend: React 19 + Tailwind + Sonner + lucide-react. Custom CSS animations `cubic-bezier(0.25, 0.46, 0.45, 0.94)` @ 0.4s.
- Auth: Emergent Google OAuth — session_token in httpOnly cookie, server-side validated via `/auth/me`. Admin gated by `ADMIN_EMAILS` env allowlist.

## Endpoints
### Public (localized via `?lang=en|ru`, default en)
- GET `/api/` — health
- GET `/api/config` — usd_rub_rate, ru_discount, languages
- GET `/api/products` (optional `?category=`)
- GET `/api/products/categories`
- GET `/api/hero`
- GET `/api/lookbook`
- POST `/api/newsletter` { email } — 409 on duplicate
- GET `/api/newsletter/count`

### Auth
- POST `/api/auth/session` { session_id } — exchange Emergent session_id, sets cookie
- GET `/api/auth/me` — current user (incl. `is_admin`)
- POST `/api/auth/logout`

### Admin (require admin)
- GET / POST / PUT / DELETE `/api/admin/products[/{id}]`
- GET / POST / PUT / DELETE `/api/admin/hero[/{id}]`
- GET / POST / PUT / DELETE `/api/admin/lookbook[/{id}]`

## Routes (frontend)
- `/` → 302 to `/en` or `/ru` based on `navigator.language`
- `/en` / `/ru` → Localized Home
- `/admin` → Admin (Google sign-in → dashboard)
- Auth callback: `session_id` in URL hash on `/admin` is captured synchronously by AppRouter and processed by `AuthCallback`.

## Core requirements (static)
- Brutalist B/W aesthetic, strict borders, no rounded corners
- 0.4s + cubic-bezier(0.25, 0.46, 0.45, 0.94) for ALL transitions
- Product dual-image opacity cross-fade
- Right-slide overlay nav
- Lookbook category fade
- Inverted hover on every button
- Bilingual: identical layout, independently edited content per language
- RU price formula (default): `round(usd * USD_RUB_RATE * 0.95)`, override possible

## Implemented
- Hero full-screen slider with Ken Burns + horizontal slide + counter + swipe
- Product grid with dual-image opacity hover + server-filtered categories
- Lookbook with 4 tabs, fade transitions, auto-cycle in view
- Right-slide nav overlay (localized labels)
- Newsletter signup (MongoDB-backed, duplicate detection)
- Marquee + Editorial strip + Footer
- Bilingual data model + `localize_*` helpers per request lang
- Language toggle (EN / RU) with in-place URL switch
- Browser-language detection at root
- Admin panel: Emergent Google OAuth, allowlist, dashboard with three tabs (Products/Hero/Lookbook), bilingual inline editing, live computed RU price preview, USD price input + price_rub_override, CRUD + delete confirmation

## Backlog
- P1: Product detail page + cart
- P1: Persist user lang choice in localStorage (not just URL)
- P1: 201 status code on create endpoints
- P2: Bag drawer + Stripe checkout (RUB + USD)
- P2: Image gallery / zoom on product page
- P2: Add Image upload (instead of URL) for admin
- P2: Soft-seed gating per collection
- P3: Migrate `@app.on_event` to FastAPI lifespan
- P3: i18n for `/admin` UI itself (currently EN-only labels)
- P3: SEO meta tags per locale + hreflang

## Next tasks
1. Product detail route with localized data
2. Cart + checkout (Stripe)
3. Image upload component for admin
