# AXUM — Product Requirements Document

## Original problem statement
High-end fashion e-commerce storefront landing page, brutalist/minimalist aesthetic, strict full-width grid with thin black borders, white background, bold sans-serif headings, monotone palette. Site name: AXUM. Required: dual-image cross-fade product hover (0.4s, ease-in-out), full-screen hero slider with horizontal slide + Ken Burns, right-slide overlay nav, lookbook with fade transitions on category change, inverted-color button hovers.

## Architecture
- Backend: FastAPI + Motor (MongoDB) under `/api` prefix. Auto-seeds 8 products, 3 hero slides, 4 lookbook items on startup.
- Frontend: React 19 + Tailwind, Sonner toaster, lucide-react icons, custom CSS animations using `cubic-bezier(0.25, 0.46, 0.45, 0.94)` @ 0.4s.

## Endpoints
- GET `/api/` — health
- GET `/api/products` (optional `?category=`)
- GET `/api/products/categories`
- GET `/api/hero`
- GET `/api/lookbook`
- POST `/api/newsletter` { email } — 409 on duplicate
- GET `/api/newsletter/count`

## User personas
- Editorial-minded shopper browsing collection
- Industry press / lookbook viewer
- Newsletter subscriber for archival dispatches

## Core requirements (static)
- Brutalist B/W aesthetic, strict borders, no rounded corners
- 0.4s + cubic-bezier(0.25, 0.46, 0.45, 0.94) for ALL transitions
- Product dual-image opacity cross-fade
- Right-slide overlay nav
- Lookbook category fade
- Inverted hover on every button

## Implemented (2025-12)
- Hero full-screen slider (autoplay + prev/next/swipe, Ken Burns active zoom, counter)
- Product catalog grid (4-col, dual-image hover, category tabs, server-filter)
- Right-slide NavOverlay with 6 categories + close
- Lookbook (4 tabs, fade-in image swap, auto-cycle when in view)
- Editorial Strip (manifesto / studio / index columns)
- Brutalist Newsletter with backend signup, success state, duplicate detection (409)
- Marquee announcement strip
- Footer with 4 link columns + giant AXUM wordmark

## Backlog
- P1: Product detail page + cart
- P1: Smooth Lenis/scroll lock during nav overlay open
- P2: Sticky add-to-bag + bag drawer
- P2: Image gallery / zoom on product page
- P2: Localization (FR/JP/EN)
- P3: Connect Stripe checkout
- P3: CMS-driven content (replace seed data)

## Next tasks
1. Build product detail route
2. Bag/cart drawer + persistence
3. Stripe integration for checkout
