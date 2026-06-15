#!/usr/bin/env python3
"""Zero-dependency mock of the AXUM API for local UI demos.

Why this exists: the real backend needs MongoDB + Python deps, and the remote
preview backend currently 404s. This stdlib-only server lets you SEE the
homepage (hero, catalog, lookbook) — including the three new studio-drop
photos — without installing anything.

    python3 scripts/mock_api.py            # serves on http://localhost:8001

Then point the frontend at it:  REACT_APP_BACKEND_URL=http://localhost:8001
and restart `npm start`. Not for production — demo data only.
"""
import json
import os
import sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse, parse_qs

# Import the shared placeholder catalog from backend/catalog_seed.py so this mock
# demo, the FastAPI fresh-DB seed, and the reseed script all serve the SAME shop.
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from catalog_seed import PLACEHOLDER_PRODUCTS  # noqa: E402

USD_RUB_RATE = 72.0
RU_DISCOUNT = 0.95

# New drop — local images (served by the CRA dev server at /products/*).
_BLACK = "/products/axum-black-hooded-zip-set.jpg"
_PINK = "/products/axum-pink-laceup-cargo.jpg"
_RED = "/products/axum-red-sheer-slip-dress.jpg"

# Existing catalog imagery (remote, still live).
# Local studio photos (served by the CRA dev server at /products/*), matching
# backend/server.py. Self-contained: no dependency on the remote CDN.
_A = "/products/dsc-04491-graphite-zip-bustier.jpg"     # DSC04491
_B = "/products/dsc-05434-ivory-pleat-back.jpg"         # DSC05434
_C = "/products/dsc-05565-ivory-canvas-bustier.jpg"     # DSC05565
_D = "/products/dsc-05198-fuchsia-corset-cargo.jpg"     # DSC05198
_E = "/products/dsc-04702-violet-laceup-corset.jpg"     # DSC04702
_F = "/products/iks-03092-fuchsia-corset-crop.jpg"      # IKS03092
# IKS03144 wasn't in the local drop — this one secondary view stays on the CDN.
_G = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/7fs0ph46_IKS03144.jpg"
_H = "/products/dsc-04854-onyx-hood-wideleg.jpg"        # DSC04854
_I = "/products/dsc-04772-onyx-hood-front.jpg"          # DSC04772
_J = "/products/dsc-04820-onyx-hood-threequarter.jpg"   # DSC04820

# Shop catalog — 2026 "catalog ALL" drop: 152 studio photos grouped into one
# product per garment (each with an `images` array of all its angles), generated
# in backend/catalog_seed.py. Stable per-look ids so deep links survive a restart.
PRODUCTS = []
for _i, _p in enumerate(PLACEHOLDER_PRODUCTS, start=1):
    _d = dict(_p)
    _d["id"] = f"axum-look-{_i:02d}"
    PRODUCTS.append(_d)

HERO = [
    {"id": "h1", "headline_en": "AXUM — SCARLET EDITION", "headline_ru": "AXUM — ВЫПУСК СКАРЛЕТ",
     "subline_en": "Volume 05 / The New Silhouette", "subline_ru": "Том 05 / Новый силуэт",
     "cta_en": "SHOP THE EDITION", "cta_ru": "СМОТРЕТЬ ВЫПУСК", "image": _RED, "sort_order": 0},
    {"id": "h2", "headline_en": "AXUM — ROSE COURT", "headline_ru": "AXUM — РОЗОВЫЙ КОРТ",
     "subline_en": "Sport meets couture", "subline_ru": "Спорт встречает кутюр",
     "cta_en": "ENTER COLLECTION", "cta_ru": "В КОЛЛЕКЦИЮ", "image": _PINK, "sort_order": 1},
]

# NEW COLLECTION (noir) editorial — homepage lookbook tiles. Each carries a
# dedicated, garment-descriptive `alt_en`/`alt_ru` (NOT the branded title) so the
# swapped <img> meets WCAG 1.1.1 (accessibility-lead sign-off). Photos are the
# white-background studio composites served from /products/lookbook/.
LOOKBOOK = [
    {"id": "l1", "tab": "NOIR_01", "title_en": "Volume 01 — Hooded Garter Dress", "title_ru": "Том 01 — Платье с капюшоном",
     "description_en": "Ruched hooded mini, detachable sleeves, over-knee socks.",
     "description_ru": "Сборчатое мини с капюшоном, съёмные рукава, гетры выше колена.",
     "alt_en": "Model in a black hooded ruched mini dress with detachable long sleeves and over-the-knee socks, shown from front, side and back.",
     "alt_ru": "Модель в чёрном сборчатом мини-платье с капюшоном, съёмными длинными рукавами и гетрами выше колена — вид спереди, сбоку и сзади.",
     "image": "/products/lookbook/look-noir-01.jpg", "sort_order": 0},
    {"id": "l2", "tab": "NOIR_02", "title_en": "Volume 02 — Bell-Sleeve Flare", "title_ru": "Том 02 — Расклёшенный силуэт",
     "description_en": "Lace-up bell-sleeve crop over lace-up flared trousers.",
     "description_ru": "Топ с расклёшенными рукавами на шнуровке и клёш-брюки.",
     "alt_en": "Model in a black lace-up bell-sleeve crop top with matching lace-up flared trousers, shown in two poses.",
     "alt_ru": "Модель в чёрном топе на шнуровке с расклёшенными рукавами и брюках клёш на шнуровке — в двух позах.",
     "image": "/products/lookbook/look-noir-02.jpg", "sort_order": 1},
    {"id": "l3", "tab": "NOIR_03", "title_en": "Volume 03 — Hooded Zip", "title_ru": "Том 03 — Капюшон на молнии",
     "description_en": "Thumbhole hooded zip and micro short.",
     "description_ru": "Зип-худи с прорезями для пальцев и микрошорты.",
     "alt_en": "Model in a black hooded zip top with thumbhole sleeves, black micro shorts and lace-up tall boots, shown from front, side and back.",
     "alt_ru": "Модель в чёрном зип-худи с прорезями для пальцев, микрошортах и высоких ботинках на шнуровке — вид спереди, сбоку и сзади.",
     "image": "/products/lookbook/look-noir-03.jpg", "sort_order": 2},
    {"id": "l4", "tab": "NOIR_04", "title_en": "Volume 04 — Lace-Up Court", "title_ru": "Том 04 — Шнуровка",
     "description_en": "Lace-up tank crop and ruched mini, knee boots.",
     "description_ru": "Топ и мини на шнуровке, высокие сапоги.",
     "alt_en": "Model in a black lace-up crop tank and ruched lace-up mini skirt with a lace-up choker and knee-high boots, shown from front, side and back.",
     "alt_ru": "Модель в чёрном топе на шнуровке и сборчатой мини-юбке на шнуровке, чокере на шнуровке и высоких сапогах — вид спереди, сбоку и сзади.",
     "image": "/products/lookbook/look-noir-04.jpg", "sort_order": 3},
    {"id": "l5", "tab": "BLOOM", "title_en": "Volume 05 — Blush Pleat", "title_ru": "Том 05 — Розовая плиссировка",
     "description_en": "Washed-pink corset top and pleated mini — editorial.",
     "description_ru": "Корсетный топ и плиссированное мини в выбеленном розовом — съёмка.",
     "alt_en": "Model with long pink hair and pink fairy wings in a pink corset top and pleated mini skirt, side profile against a pale mint backdrop.",
     "alt_ru": "Модель с длинными розовыми волосами и розовыми крыльями феи в розовом корсетном топе и плиссированной мини-юбке, профиль на бледно-мятном фоне.",
     "image": "/products/lookbook/IMG_7290.jpg", "sort_order": 4},
    {"id": "l6", "tab": "CHROME", "title_en": "Volume 06 — Star Corset", "title_ru": "Том 06 — Корсет со звёздами",
     "description_en": "Star-print corset, buckled mini and jacket — shot on blue leather.",
     "description_ru": "Корсет со звёздами, мини с пряжкой и куртка — на синей коже.",
     "alt_en": "Overhead shot of a model reclining on a blue leather sofa in a black star-print corset, buckled black mini skirt, open black jacket, sunglasses and chunky black sneakers.",
     "alt_ru": "Съёмка сверху: модель лежит на синем кожаном диване в чёрном корсете со звёздным принтом, чёрной мини-юбке с пряжкой, расстёгнутой чёрной куртке, очках и массивных чёрных кроссовках.",
     "image": "/products/lookbook/IMG_5906.jpg", "sort_order": 5},
    {"id": "l7", "tab": "HEDONIST", "title_en": "Volume 07 — Hedonist", "title_ru": "Том 07 — Hedonist",
     "description_en": "Tie-dye shorts and hooded jacket — motion, streetwear.",
     "description_ru": "Шорты тай-дай и худи с капюшоном — движение, стритвир.",
     "alt_en": "Person in motion in an open black hooded jacket, red-and-black tie-dye knee shorts with a silver chain and chunky pink high-top sneakers, in front of a white studio wall stencilled \"HEDONIST\".",
     "alt_ru": "Человек в движении в расстёгнутой чёрной куртке с капюшоном, красно-чёрных шортах тай-дай до колена с серебряной цепью и массивных розовых высоких кроссовках, на фоне белой студийной стены с трафаретной надписью «HEDONIST».",
     "image": "/products/lookbook/IMG_5350.jpg", "sort_order": 6},
]


def fmt_usd(amount):
    return f"${int(amount)}" if float(amount).is_integer() else f"${amount:.2f}"


def fmt_rub(amount):
    return f"{int(round(amount)):,}".replace(",", " ") + " ₽"


def _gallery(p, name, lang):
    """Ordered [{src, alt}] for the product-page gallery. First photo is the
    front (alt = garment name); the rest are alternate angles (alt = "..., view
    N" / "..., ракурс N") so each thumbnail has a unique, descriptive name
    instead of N identical alts (WCAG 1.1.1 / accessibility-lead sign-off)."""
    srcs = p.get("images") or [s for s in (p.get("image1"), p.get("image2")) if s]
    view = "ракурс" if lang == "ru" else "view"
    return [{"src": s, "alt": name if i == 0 else f"{name}, {view} {i + 1}"}
            for i, s in enumerate(srcs)]


def localize_product(p, lang):
    if lang == "ru":
        rub = round(p["price_usd"] * USD_RUB_RATE * RU_DISCOUNT)
        name = p["name_ru"]
        return {"id": p["id"], "name": name, "description": p["description_ru"],
                "category": p["category_ru"], "price": fmt_rub(rub), "price_value": rub,
                "currency": "RUB", "image1": p["image1"], "image2": p["image2"],
                "images": _gallery(p, name, "ru"),
                "alt1": p.get("alt1_ru") or p.get("alt1_en") or name,
                "alt2": p.get("alt2_ru") or name, "sort_order": p["sort_order"]}
    name = p["name_en"]
    return {"id": p["id"], "name": name, "description": p["description_en"],
            "category": p["category_en"], "price": fmt_usd(p["price_usd"]), "price_value": p["price_usd"],
            "currency": "USD", "image1": p["image1"], "image2": p["image2"],
            "images": _gallery(p, name, "en"),
            "alt1": p.get("alt1_en") or name,
            "alt2": p.get("alt2_en") or name, "sort_order": p["sort_order"]}


def localize_hero(h, lang):
    return {"id": h["id"], "headline": h[f"headline_{lang}"], "subline": h[f"subline_{lang}"],
            "cta": h[f"cta_{lang}"], "image": h["image"], "sort_order": h["sort_order"]}


def localize_lookbook(l, lang):
    # `alt` is a dedicated, garment-descriptive accessible name for the swapped
    # <img> (falls back to the title for any legacy record without one).
    return {"id": l["id"], "tab": l["tab"], "title": l[f"title_{lang}"],
            "description": l[f"description_{lang}"],
            "alt": l.get(f"alt_{lang}") or l[f"title_{lang}"],
            "image": l["image"], "sort_order": l["sort_order"]}


class Handler(BaseHTTPRequestHandler):
    def _cors_headers(self):
        # The SPA calls axios with `withCredentials = true`. Credentialed CORS
        # forbids a wildcard origin and requires Allow-Credentials, so we echo
        # the caller's Origin (falling back to * only for non-browser tools like
        # curl, which send no Origin and don't enforce credentials).
        origin = self.headers.get("Origin", "*")
        self.send_header("Access-Control-Allow-Origin", origin)
        if origin != "*":
            self.send_header("Access-Control-Allow-Credentials", "true")
        self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        # Wildcard does NOT cover Authorization under credentialed CORS — reflect
        # exactly what the preflight asked for, with a sensible default.
        req_headers = self.headers.get(
            "Access-Control-Request-Headers", "Authorization, Content-Type")
        self.send_header("Access-Control-Allow-Headers", req_headers)
        self.send_header("Access-Control-Max-Age", "600")

    def _send(self, payload, status=200):
        body = json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self._cors_headers()
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def log_message(self, *args):
        pass  # quiet

    def do_GET(self):
        u = urlparse(self.path)
        path = u.path.rstrip("/")
        q = parse_qs(u.query)
        lang = (q.get("lang", ["en"])[0]).lower()
        if lang not in ("en", "ru"):
            lang = "en"

        if path in ("/api", "/api/"):
            return self._send({"message": "AXUM mock API", "version": "mock"})
        if path == "/api/config":
            return self._send({"usd_rub_rate": USD_RUB_RATE, "ru_discount": RU_DISCOUNT,
                               "supported_languages": ["en", "ru"]})
        if path == "/api/products/categories":
            cats = ["ALL"] + sorted({p[f"category_{lang}"] for p in PRODUCTS},
                                    key=lambda c: [p[f"category_{lang}"] for p in PRODUCTS].index(c))
            return self._send({"categories": cats})
        if path == "/api/products":
            cat = q.get("category", [None])[0]
            items = sorted(PRODUCTS, key=lambda p: p["sort_order"])
            if cat and cat != "ALL":
                items = [p for p in items if p[f"category_{lang}"] == cat]
            return self._send([localize_product(p, lang) for p in items])
        if path.startswith("/api/products/"):
            pid = path.rsplit("/", 1)[-1]
            p = next((x for x in PRODUCTS if x["id"] == pid), None)
            return self._send(localize_product(p, lang)) if p else self._send({"detail": "not found"}, 404)
        if path == "/api/hero":
            return self._send([localize_hero(h, lang) for h in sorted(HERO, key=lambda h: h["sort_order"])])
        if path == "/api/lookbook":
            return self._send([localize_lookbook(l, lang) for l in sorted(LOOKBOOK, key=lambda l: l["sort_order"])])
        if path == "/api/payments/config":
            return self._send({"enabled": False, "provider": "xendit", "currency": "IDR"})
        return self._send({"detail": "not found", "path": path}, 404)


if __name__ == "__main__":
    port = 8001
    print(f"AXUM mock API on http://localhost:{port}  (Ctrl-C to stop)")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
