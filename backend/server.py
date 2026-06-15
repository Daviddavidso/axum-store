from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
import uuid
import base64
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Literal
from datetime import datetime, timezone, timedelta


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_EMAILS = {e.strip().lower() for e in os.environ.get('ADMIN_EMAILS', '').split(',') if e.strip()}
USD_RUB_RATE = float(os.environ.get('USD_RUB_RATE', '72'))
RU_DISCOUNT = 0.95  # RU baseline = USD * rate * 0.95

# Xendit (hosted Invoice). The customer is redirected to a Xendit-hosted payment
# page; payment status is confirmed via webhook. Xendit accounts settle in a fixed
# currency (IDR by default), so store totals (USD/RUB) are converted before the
# invoice is created.
XENDIT_SECRET_KEY = os.environ.get('XENDIT_SECRET_KEY', '')
XENDIT_WEBHOOK_TOKEN = os.environ.get('XENDIT_WEBHOOK_TOKEN', '')
XENDIT_CURRENCY = os.environ.get('XENDIT_CURRENCY', 'IDR').upper()
USD_IDR_RATE = float(os.environ.get('USD_IDR_RATE', '16000'))
# Fallback site origin for Xendit return URLs when the request omits one.
PUBLIC_BASE_URL = os.environ.get('PUBLIC_BASE_URL', '').rstrip('/')
XENDIT_API_BASE = "https://api.xendit.co"

app = FastAPI(title="AXUM API")
api_router = APIRouter(prefix="/api")

# ============== Models ==============
Lang = Literal["en", "ru"]


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_en: str
    name_ru: str
    description_en: str = ""
    description_ru: str = ""
    category_en: str
    category_ru: str
    price_usd: float
    price_rub_override: Optional[float] = None  # if set, used; else computed
    image1: str
    image2: str
    # Ordered list of every studio angle for this garment (front first). The card
    # uses image1/image2; the product page renders the full gallery. Falls back
    # to [image1, image2] when a legacy product has no images array.
    images: List[str] = Field(default_factory=list)
    # Per-image alt text. alt1 -> primary (front) photo, alt2 -> hover/back photo.
    # Both fall back to the product name when empty so the alt always describes
    # the picture, never the literal string "<name> alt" (WCAG 1.1.1 / 3.1.2).
    alt1_en: str = ""
    alt1_ru: str = ""
    alt2_en: str = ""
    alt2_ru: str = ""
    sort_order: int = 0


class ProductCreate(BaseModel):
    name_en: str
    name_ru: str
    description_en: str = ""
    description_ru: str = ""
    category_en: str
    category_ru: str
    price_usd: float
    price_rub_override: Optional[float] = None
    image1: str
    image2: str
    images: List[str] = Field(default_factory=list)
    alt1_en: str = ""
    alt1_ru: str = ""
    alt2_en: str = ""
    alt2_ru: str = ""
    sort_order: int = 0


class ProductUpdate(BaseModel):
    name_en: Optional[str] = None
    name_ru: Optional[str] = None
    description_en: Optional[str] = None
    description_ru: Optional[str] = None
    category_en: Optional[str] = None
    category_ru: Optional[str] = None
    price_usd: Optional[float] = None
    price_rub_override: Optional[float] = None
    image1: Optional[str] = None
    image2: Optional[str] = None
    images: Optional[List[str]] = None
    alt1_en: Optional[str] = None
    alt1_ru: Optional[str] = None
    alt2_en: Optional[str] = None
    alt2_ru: Optional[str] = None
    sort_order: Optional[int] = None


class HeroSlide(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    headline_en: str
    headline_ru: str
    subline_en: str = ""
    subline_ru: str = ""
    cta_en: str = "SHOP NOW"
    cta_ru: str = "СМОТРЕТЬ"
    image: str
    sort_order: int = 0


class HeroSlideCreate(BaseModel):
    headline_en: str
    headline_ru: str
    subline_en: str = ""
    subline_ru: str = ""
    cta_en: str = "SHOP NOW"
    cta_ru: str = "СМОТРЕТЬ"
    image: str
    sort_order: int = 0


class HeroSlideUpdate(BaseModel):
    headline_en: Optional[str] = None
    headline_ru: Optional[str] = None
    subline_en: Optional[str] = None
    subline_ru: Optional[str] = None
    cta_en: Optional[str] = None
    cta_ru: Optional[str] = None
    image: Optional[str] = None
    sort_order: Optional[int] = None


class LookbookItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tab: str  # locale-neutral key
    title_en: str
    title_ru: str
    description_en: str = ""
    description_ru: str = ""
    # Dedicated, garment-descriptive accessible name for the tile image (WCAG
    # 1.1.1). Falls back to the title in the serializer when empty.
    alt_en: str = ""
    alt_ru: str = ""
    image: str
    sort_order: int = 0


class LookbookCreate(BaseModel):
    tab: str
    title_en: str
    title_ru: str
    description_en: str = ""
    description_ru: str = ""
    alt_en: str = ""
    alt_ru: str = ""
    image: str
    sort_order: int = 0


class LookbookUpdate(BaseModel):
    tab: Optional[str] = None
    title_en: Optional[str] = None
    title_ru: Optional[str] = None
    description_en: Optional[str] = None
    description_ru: Optional[str] = None
    alt_en: Optional[str] = None
    alt_ru: Optional[str] = None
    image: Optional[str] = None
    sort_order: Optional[int] = None


class NewsletterCreate(BaseModel):
    email: EmailStr


class NewsletterEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: str = ""
    is_admin: bool = False


# ============== Helpers ==============
def compute_price_rub(p: dict) -> float:
    override = p.get('price_rub_override')
    if override is not None:
        return float(override)
    return round(float(p.get('price_usd', 0)) * USD_RUB_RATE * RU_DISCOUNT)


def format_price(amount: float, lang: str) -> str:
    if lang == "ru":
        # Format with thousand separator (non-breaking space)
        return f"{int(round(amount)):,}".replace(",", "\u00A0") + " ₽"
    # USD
    if float(amount).is_integer():
        return f"${int(amount)}"
    return f"${amount:.2f}"


def build_gallery(p: dict, name: str, lang: str) -> list:
    """Ordered [{src, alt}] for the product-page gallery. First photo is the
    front (alt = garment name); the rest are alternate angles ("..., view N" /
    "..., ракурс N") so every thumbnail has a unique, descriptive accessible
    name instead of N identical alts (WCAG 1.1.1)."""
    srcs = p.get("images") or [s for s in (p.get("image1"), p.get("image2")) if s]
    view = "ракурс" if lang == "ru" else "view"
    return [{"src": s, "alt": name if i == 0 else f"{name}, {view} {i + 1}"}
            for i, s in enumerate(srcs)]


def localize_product(p: dict, lang: str) -> dict:
    rub = compute_price_rub(p)
    if lang == "ru":
        name = p.get("name_ru") or p.get("name_en", "")
        return {
            "id": p["id"],
            "name": name,
            "description": p.get("description_ru") or p.get("description_en", ""),
            "category": p.get("category_ru") or p.get("category_en", ""),
            "price": format_price(rub, "ru"),
            "price_value": rub,
            "currency": "RUB",
            "image1": p["image1"],
            "image2": p["image2"],
            "images": build_gallery(p, name, "ru"),
            "alt1": p.get("alt1_ru") or p.get("alt1_en") or name,
            "alt2": p.get("alt2_ru") or p.get("alt2_en") or name,
            "sort_order": p.get("sort_order", 0),
        }
    name = p.get("name_en", "")
    return {
        "id": p["id"],
        "name": name,
        "description": p.get("description_en", ""),
        "category": p.get("category_en", ""),
        "price": format_price(p.get("price_usd", 0), "en"),
        "price_value": p.get("price_usd", 0),
        "currency": "USD",
        "image1": p["image1"],
        "image2": p["image2"],
        "images": build_gallery(p, name, "en"),
        "alt1": p.get("alt1_en") or name,
        "alt2": p.get("alt2_en") or name,
        "sort_order": p.get("sort_order", 0),
    }


def localize_hero(h: dict, lang: str) -> dict:
    return {
        "id": h["id"],
        "headline": h.get(f"headline_{lang}") or h.get("headline_en", ""),
        "subline": h.get(f"subline_{lang}") or h.get("subline_en", ""),
        "cta": h.get(f"cta_{lang}") or h.get("cta_en", ""),
        "image": h["image"],
        "sort_order": h.get("sort_order", 0),
    }


def localize_lookbook(l: dict, lang: str) -> dict:
    title = l.get(f"title_{lang}") or l.get("title_en", "")
    return {
        "id": l["id"],
        "tab": l["tab"],
        "title": title,
        "description": l.get(f"description_{lang}") or l.get("description_en", ""),
        # Dedicated, garment-descriptive accessible name for the swapped <img>
        # (WCAG 1.1.1); falls back to the title for any legacy record.
        "alt": l.get(f"alt_{lang}") or l.get("alt_en") or title,
        "image": l["image"],
        "sort_order": l.get("sort_order", 0),
    }


# ============== Seed (authentic catalog) ==============
# The studio photos are now served locally from frontend/public/products/ so the
# catalog is self-contained and no longer depends on the remote customer-assets
# CDN (the remote backend host already went 404 once). Originals were the
# client's DSC*/IKS* shoot files, downscaled to 1400px-wide web copies.
_A = "/products/dsc-04491-graphite-zip-bustier.jpg"     # DSC04491
_B = "/products/dsc-05434-ivory-pleat-back.jpg"         # DSC05434
_C = "/products/dsc-05565-ivory-canvas-bustier.jpg"     # DSC05565
_D = "/products/dsc-05198-fuchsia-corset-cargo.jpg"     # DSC05198
_E = "/products/dsc-04702-violet-laceup-corset.jpg"     # DSC04702
_F = "/products/iks-03092-fuchsia-corset-crop.jpg"      # IKS03092
# IKS03144 wasn't in the local drop, so this one secondary view stays on the CDN.
_G = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/7fs0ph46_IKS03144.jpg"
_H = "/products/dsc-04854-onyx-hood-wideleg.jpg"        # DSC04854
_I = "/products/dsc-04772-onyx-hood-front.jpg"          # DSC04772
_J = "/products/dsc-04820-onyx-hood-threequarter.jpg"   # DSC04820

# New studio drop — photos served from frontend/public/products/ (relative URLs
# resolve against whatever origin serves the SPA). Single hero shot per look, so
# image1 == image2; alt2 carries the full descriptive alt for the second slot.
_NEW_BLACK = "/products/axum-black-hooded-zip-set.jpg"
_NEW_PINK = "/products/axum-pink-laceup-cargo.jpg"
_NEW_RED = "/products/axum-red-sheer-slip-dress.jpg"

# Hero campaign imagery (uploaded by client)
_HERO_1 = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/95nmxgyn_David_Son_combine_them__do_not_add_any_your_texts_or_logos_just_use_logos_726a2ee3-9ce4-42d4-9002-f8a2be449805%20%281%29.png"
_HERO_2 = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/9hwnqte3_David_Son_combined_them__do_not_add_any_your_texts__or_logos_just_use_log_5a8ac7c0-0b59-4d6d-9813-1bf86220d0e7%20%281%29.png"

SEED_HERO = [
    {"id": str(uuid.uuid4()), "headline_en": "AXUM — STUDIO N°02", "headline_ru": "AXUM — СТУДИЯ №02",
     "subline_en": "Volume 04 / The New Silhouette", "subline_ru": "Том 04 / Новый силуэт",
     "cta_en": "ENTER COLLECTION", "cta_ru": "В КОЛЛЕКЦИЮ", "image": _HERO_1, "sort_order": 0},
    {"id": str(uuid.uuid4()), "headline_en": "AXUM — PINK COURT", "headline_ru": "AXUM — РОЗОВЫЙ КОРТ",
     "subline_en": "Sport meets couture", "subline_ru": "Спорт встречает кутюр",
     "cta_en": "SHOP THE EDITION", "cta_ru": "СМОТРЕТЬ ВЫПУСК", "image": _HERO_2, "sort_order": 1},
]

# 2026 "catalog ALL" studio drop — 76 placeholder looks (paired front/back
# photos), generated in backend/catalog_seed.py. Each is an editable placeholder
# (AXUM LOOK NN) the client refines later in the admin CMS. Photos live under
# frontend/public/products/catalog/ as look-NN-a.jpg / look-NN-b.jpg.
from catalog_seed import PLACEHOLDER_PRODUCTS
SEED_PRODUCTS = [dict(_p) for _p in PLACEHOLDER_PRODUCTS]
for _p in SEED_PRODUCTS:
    _p["id"] = str(uuid.uuid4())

# NEW COLLECTION (noir) editorial — homepage lookbook tiles. Each carries a
# dedicated, garment-descriptive alt_en/alt_ru (NOT the branded title) so the
# swapped <img> meets WCAG 1.1.1 (accessibility-lead sign-off). Photos are the
# white-background studio composites served from /products/lookbook/.
SEED_LOOKBOOK = [
    {"id": str(uuid.uuid4()), "tab": "NOIR_01",
     "title_en": "Volume 01 — Hooded Garter Dress", "title_ru": "Том 01 — Платье с капюшоном",
     "description_en": "Ruched hooded mini, detachable sleeves, over-knee socks.",
     "description_ru": "Сборчатое мини с капюшоном, съёмные рукава, гетры выше колена.",
     "alt_en": "Model in a black hooded ruched mini dress with detachable long sleeves and over-the-knee socks, shown from front, side and back.",
     "alt_ru": "Модель в чёрном сборчатом мини-платье с капюшоном, съёмными длинными рукавами и гетрами выше колена — вид спереди, сбоку и сзади.",
     "image": "/products/lookbook/DSC05053.jpg", "sort_order": 0},
    {"id": str(uuid.uuid4()), "tab": "NOIR_02",
     "title_en": "Volume 02 — Bell-Sleeve Flare", "title_ru": "Том 02 — Расклёшенный силуэт",
     "description_en": "Lace-up bell-sleeve crop over lace-up flared trousers.",
     "description_ru": "Топ с расклёшенными рукавами на шнуровке и клёш-брюки.",
     "alt_en": "Model in a black lace-up bell-sleeve crop top with matching lace-up flared trousers, shown in two poses.",
     "alt_ru": "Модель в чёрном топе на шнуровке с расклёшенными рукавами и брюках клёш на шнуровке — в двух позах.",
     "image": "/products/lookbook/DSC04403.jpg", "sort_order": 1},
    {"id": str(uuid.uuid4()), "tab": "NOIR_03",
     "title_en": "Volume 03 — Hooded Zip", "title_ru": "Том 03 — Капюшон на молнии",
     "description_en": "Thumbhole hooded zip and micro short.",
     "description_ru": "Зип-худи с прорезями для пальцев и микрошорты.",
     "alt_en": "Model in a black hooded zip top with thumbhole sleeves, black micro shorts and lace-up tall boots, shown from front, side and back.",
     "alt_ru": "Модель в чёрном зип-худи с прорезями для пальцев, микрошортах и высоких ботинках на шнуровке — вид спереди, сбоку и сзади.",
     "image": "/products/lookbook/DSC04835.jpg", "sort_order": 2},
    {"id": str(uuid.uuid4()), "tab": "NOIR_04",
     "title_en": "Volume 04 — Lace-Up Court", "title_ru": "Том 04 — Шнуровка",
     "description_en": "Lace-up tank crop and ruched mini, knee boots.",
     "description_ru": "Топ и мини на шнуровке, высокие сапоги.",
     "alt_en": "Model in a black lace-up crop tank and ruched lace-up mini skirt with a lace-up choker and knee-high boots, shown from front, side and back.",
     "alt_ru": "Модель в чёрном топе на шнуровке и сборчатой мини-юбке на шнуровке, чокере на шнуровке и высоких сапогах — вид спереди, сбоку и сзади.",
     "image": "/products/lookbook/DSC04316.jpg", "sort_order": 3},
    {"id": str(uuid.uuid4()), "tab": "BLOOM",
     "title_en": "Volume 05 — Blush Pleat", "title_ru": "Том 05 — Розовая плиссировка",
     "description_en": "Washed-pink corset top and pleated mini — editorial.",
     "description_ru": "Корсетный топ и плиссированное мини в выбеленном розовом — съёмка.",
     "alt_en": "Model with long pink hair and pink fairy wings in a pink corset top and pleated mini skirt, side profile against a pale mint backdrop.",
     "alt_ru": "Модель с длинными розовыми волосами и розовыми крыльями феи в розовом корсетном топе и плиссированной мини-юбке, профиль на бледно-мятном фоне.",
     "image": "/products/lookbook/IMG_7290.jpg", "sort_order": 4},
    {"id": str(uuid.uuid4()), "tab": "CHROME",
     "title_en": "Volume 06 — Star Corset", "title_ru": "Том 06 — Корсет со звёздами",
     "description_en": "Star-print corset, buckled mini and jacket — shot on blue leather.",
     "description_ru": "Корсет со звёздами, мини с пряжкой и куртка — на синей коже.",
     "alt_en": "Overhead shot of a model reclining on a blue leather sofa in a black star-print corset, buckled black mini skirt, open black jacket, sunglasses and chunky black sneakers.",
     "alt_ru": "Съёмка сверху: модель лежит на синем кожаном диване в чёрном корсете со звёздным принтом, чёрной мини-юбке с пряжкой, расстёгнутой чёрной куртке, очках и массивных чёрных кроссовках.",
     "image": "/products/lookbook/IMG_5906.jpg", "sort_order": 5},
    {"id": str(uuid.uuid4()), "tab": "HEDONIST",
     "title_en": "Volume 07 — Hedonist", "title_ru": "Том 07 — Hedonist",
     "description_en": "Tie-dye shorts and hooded jacket — motion, streetwear.",
     "description_ru": "Шорты тай-дай и худи с капюшоном — движение, стритвир.",
     "alt_en": "Person in motion in an open black hooded jacket, red-and-black tie-dye knee shorts with a silver chain and chunky pink high-top sneakers, in front of a white studio wall stencilled \"HEDONIST\".",
     "alt_ru": "Человек в движении в расстёгнутой чёрной куртке с капюшоном, красно-чёрных шортах тай-дай до колена с серебряной цепью и массивных розовых высоких кроссовках, на фоне белой студийной стены с трафаретной надписью «HEDONIST».",
     "image": "/products/lookbook/IMG_5350.jpg", "sort_order": 6},
]


async def seed_if_needed():
    # Only reseed when all three collections are empty (fresh DB).
    # Existing admin-edited data is preserved.
    p_empty = await db.products.count_documents({}) == 0
    h_empty = await db.hero_slides.count_documents({}) == 0
    l_empty = await db.lookbook.count_documents({}) == 0
    if p_empty and h_empty and l_empty:
        await db.products.insert_many([dict(p) for p in SEED_PRODUCTS])
        await db.hero_slides.insert_many([dict(h) for h in SEED_HERO])
        await db.lookbook.insert_many([dict(l) for l in SEED_LOOKBOOK])
        logging.info("Seeded authentic AXUM catalog (13 photos / 10 products / 3 hero / 4 lookbook).")


# ============== Auth ==============
async def get_current_user(request: Request) -> User:
    # Try cookie first, then Authorization header
    token = request.cookies.get("session_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.lower().startswith("bearer "):
            token = auth.split(None, 1)[1].strip()
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    expires_at = session.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    user_doc = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user_doc:
        raise HTTPException(status_code=401, detail="User not found")
    user_doc["is_admin"] = (user_doc.get("email", "").lower() in ADMIN_EMAILS)
    return User(**user_doc)


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if not user.is_admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


# ============== Public routes ==============
@api_router.get("/")
async def root():
    return {"message": "AXUM API", "version": "2.0", "languages": ["en", "ru"]}


@api_router.get("/config")
async def get_config():
    return {
        "usd_rub_rate": USD_RUB_RATE,
        "ru_discount": RU_DISCOUNT,
        "supported_languages": ["en", "ru"],
    }


@api_router.get("/products/{product_id}")
async def get_product(product_id: str, lang: Lang = Query("en")):
    doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Product not found")
    return localize_product(doc, lang)


@api_router.get("/products")
async def list_products(
    lang: Lang = Query("en"),
    category: Optional[str] = None,
):
    query = {}
    if category and category.upper() != "ALL":
        # Filter by either localized category
        query["$or"] = [
            {"category_en": category.upper()},
            {"category_ru": category.upper()},
        ]
    docs = await db.products.find(query, {"_id": 0}).sort("sort_order", 1).to_list(200)
    return [localize_product(p, lang) for p in docs]


@api_router.get("/products/categories")
async def list_categories(lang: Lang = Query("en")):
    field = f"category_{lang}"
    cats = await db.products.distinct(field)
    return {"categories": ["ALL"] + sorted([c for c in cats if c])}


@api_router.get("/hero")
async def list_hero(lang: Lang = Query("en")):
    docs = await db.hero_slides.find({}, {"_id": 0}).sort("sort_order", 1).to_list(20)
    return [localize_hero(h, lang) for h in docs]


@api_router.get("/lookbook")
async def list_lookbook(lang: Lang = Query("en")):
    docs = await db.lookbook.find({}, {"_id": 0}).sort("sort_order", 1).to_list(50)
    return [localize_lookbook(l, lang) for l in docs]


@api_router.post("/newsletter", response_model=NewsletterEntry)
async def newsletter_signup(payload: NewsletterCreate):
    email_norm = payload.email.lower().strip()
    existing = await db.newsletter.find_one({"email": email_norm})
    if existing:
        raise HTTPException(status_code=409, detail="Email already subscribed.")
    entry = NewsletterEntry(email=email_norm)
    await db.newsletter.insert_one(entry.model_dump())
    return entry


@api_router.get("/newsletter/count")
async def newsletter_count():
    count = await db.newsletter.count_documents({})
    return {"count": count}


# ============== Payments (Xendit hosted Invoice) ==============
class CartLine(BaseModel):
    name: str
    price_value: float
    qty: int = 1
    currency: str = "USD"


class CreatePaymentRequest(BaseModel):
    items: List[CartLine]
    email: EmailStr
    first_name: str = ""
    last_name: str = ""
    phone: str = ""
    shipping: float = 0
    discount: float = 0
    currency: str = "USD"
    lang: Lang = "en"
    origin: str = ""  # site origin the customer should be returned to


def to_xendit_amount(amount: float, store_currency: str) -> float:
    """Convert a store amount (USD/RUB) into the Xendit settlement currency.

    IDR amounts are whole numbers; other currencies keep two decimals.
    """
    usd = float(amount) / USD_RUB_RATE if store_currency == "RUB" else float(amount)
    if XENDIT_CURRENCY == "IDR":
        return int(round(usd * USD_IDR_RATE))
    return round(usd, 2)


@api_router.get("/payments/config")
async def payments_config():
    return {
        "enabled": bool(XENDIT_SECRET_KEY),
        "provider": "xendit",
        "currency": XENDIT_CURRENCY,
    }


@api_router.post("/payments/xendit/create")
async def create_xendit_payment(payload: CreatePaymentRequest, request: Request):
    if not XENDIT_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Payment provider not configured")
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_id = f"AXUM-{uuid.uuid4().hex[:12].upper()}"

    items = []
    gross = 0
    for line in payload.items:
        unit = to_xendit_amount(line.price_value, payload.currency)
        items.append({"name": line.name[:255] or "Item", "quantity": int(line.qty), "price": unit})
        gross += unit * int(line.qty)
    if payload.shipping:
        ship = to_xendit_amount(payload.shipping, payload.currency)
        items.append({"name": "Shipping", "quantity": 1, "price": ship})
        gross += ship
    if payload.discount:
        gross -= to_xendit_amount(payload.discount, payload.currency)
    if XENDIT_CURRENCY == "IDR":
        gross = int(round(gross))
    else:
        gross = round(gross, 2)
    if gross <= 0:
        raise HTTPException(status_code=400, detail="Order total must be positive")

    base = (payload.origin or request.headers.get("origin") or PUBLIC_BASE_URL).rstrip("/")
    confirm = f"{base}/{payload.lang}/order/confirmation?order={order_id}"

    inv_body = {
        "external_id": order_id,
        "amount": gross,
        "currency": XENDIT_CURRENCY,
        "payer_email": str(payload.email),
        "description": f"AXUM order {order_id}",
        "success_redirect_url": f"{confirm}&status=paid",
        "failure_redirect_url": f"{confirm}&status=failed",
        "items": items,
        "customer": {
            "given_names": payload.first_name or "Customer",
            "surname": payload.last_name or "",
            "email": str(payload.email),
            "mobile_number": payload.phone or "",
        },
        "invoice_duration": 86400,
    }

    auth = base64.b64encode(f"{XENDIT_SECRET_KEY}:".encode()).decode()
    async with httpx.AsyncClient(timeout=20) as http:
        r = await http.post(
            f"{XENDIT_API_BASE}/v2/invoices",
            json=inv_body,
            headers={
                "Authorization": f"Basic {auth}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
        )
    if r.status_code not in (200, 201):
        logger.error("Xendit create failed: %s %s", r.status_code, r.text)
        raise HTTPException(status_code=502, detail="Payment provider error")
    data = r.json()
    invoice_url = data.get("invoice_url")
    if not invoice_url:
        logger.error("Xendit create missing invoice_url: %s", data)
        raise HTTPException(status_code=502, detail="Payment provider error")

    await db.orders.insert_one({
        "order_id": order_id,
        "status": "pending",
        "provider": "xendit",
        "invoice_id": data.get("id", ""),
        "amount": gross,
        "currency": XENDIT_CURRENCY,
        "store_currency": payload.currency,
        "email": str(payload.email),
        "items": [i.model_dump() for i in payload.items],
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    return {"order_id": order_id, "invoice_url": invoice_url}


@api_router.post("/payments/xendit/notification")
async def xendit_notification(request: Request):
    # Xendit signs invoice callbacks with a static token in the x-callback-token header.
    token = request.headers.get("x-callback-token", "")
    if not XENDIT_WEBHOOK_TOKEN or token != XENDIT_WEBHOOK_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid callback token")

    body = await request.json()
    order_id = body.get("external_id", "")
    xstatus = (body.get("status") or "").upper()
    if xstatus in ("PAID", "SETTLED"):
        status = "paid"
    elif xstatus in ("EXPIRED", "FAILED"):
        status = "failed"
    else:
        status = "pending"

    await db.orders.update_one(
        {"order_id": order_id},
        {"$set": {
            "status": status,
            "xendit_status": xstatus,
            "paid_amount": body.get("paid_amount"),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }},
    )
    return {"ok": True}


@api_router.get("/payments/orders/{order_id}")
async def get_order(order_id: str):
    order = await db.orders.find_one({"order_id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


# ============== Auth routes ==============
EMERGENT_SESSION_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


@api_router.post("/auth/session")
async def create_session(request: Request, response: Response):
    body = await request.json()
    session_id = body.get("session_id")
    if not session_id:
        raise HTTPException(status_code=400, detail="session_id required")
    async with httpx.AsyncClient(timeout=15) as client_http:
        r = await client_http.get(
            EMERGENT_SESSION_URL,
            headers={"X-Session-ID": session_id},
        )
    if r.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid session_id")
    data = r.json()
    email = (data.get("email") or "").lower()
    name = data.get("name") or ""
    picture = data.get("picture") or ""
    session_token = data.get("session_token") or ""
    if not (email and session_token):
        raise HTTPException(status_code=400, detail="Malformed session data")

    # Upsert user
    user_doc = await db.users.find_one({"email": email}, {"_id": 0})
    if not user_doc:
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        user_doc = {
            "user_id": user_id,
            "email": email,
            "name": name,
            "picture": picture,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.users.insert_one(user_doc)
    else:
        await db.users.update_one(
            {"email": email},
            {"$set": {"name": name, "picture": picture}},
        )
        user_id = user_doc["user_id"]

    expires_at = datetime.now(timezone.utc) + timedelta(days=7)
    await db.user_sessions.insert_one({
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat(),
    })

    response.set_cookie(
        key="session_token",
        value=session_token,
        max_age=7 * 24 * 60 * 60,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
    )
    is_admin = email in ADMIN_EMAILS
    return {
        "user_id": user_id,
        "email": email,
        "name": name,
        "picture": picture,
        "is_admin": is_admin,
    }


@api_router.get("/auth/me")
async def auth_me(user: User = Depends(get_current_user)):
    return user.model_dump()


@api_router.post("/auth/logout")
async def auth_logout(request: Request, response: Response):
    token = request.cookies.get("session_token")
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    response.delete_cookie("session_token", path="/", samesite="none", secure=True)
    return {"ok": True}


# ============== Admin routes ==============
@api_router.get("/admin/products", response_model=List[Product])
async def admin_list_products(_: User = Depends(require_admin)):
    docs = await db.products.find({}, {"_id": 0}).sort("sort_order", 1).to_list(500)
    return docs


@api_router.post("/admin/products", response_model=Product)
async def admin_create_product(payload: ProductCreate, _: User = Depends(require_admin)):
    prod = Product(**payload.model_dump())
    await db.products.insert_one(prod.model_dump())
    return prod


@api_router.put("/admin/products/{product_id}", response_model=Product)
async def admin_update_product(product_id: str, payload: ProductUpdate, _: User = Depends(require_admin)):
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await db.products.update_one({"id": product_id}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    doc = await db.products.find_one({"id": product_id}, {"_id": 0})
    return doc


@api_router.delete("/admin/products/{product_id}")
async def admin_delete_product(product_id: str, _: User = Depends(require_admin)):
    res = await db.products.delete_one({"id": product_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")
    return {"ok": True}


@api_router.get("/admin/hero", response_model=List[HeroSlide])
async def admin_list_hero(_: User = Depends(require_admin)):
    docs = await db.hero_slides.find({}, {"_id": 0}).sort("sort_order", 1).to_list(50)
    return docs


@api_router.post("/admin/hero", response_model=HeroSlide)
async def admin_create_hero(payload: HeroSlideCreate, _: User = Depends(require_admin)):
    h = HeroSlide(**payload.model_dump())
    await db.hero_slides.insert_one(h.model_dump())
    return h


@api_router.put("/admin/hero/{slide_id}", response_model=HeroSlide)
async def admin_update_hero(slide_id: str, payload: HeroSlideUpdate, _: User = Depends(require_admin)):
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await db.hero_slides.update_one({"id": slide_id}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Slide not found")
    return await db.hero_slides.find_one({"id": slide_id}, {"_id": 0})


@api_router.delete("/admin/hero/{slide_id}")
async def admin_delete_hero(slide_id: str, _: User = Depends(require_admin)):
    res = await db.hero_slides.delete_one({"id": slide_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Slide not found")
    return {"ok": True}


@api_router.get("/admin/lookbook", response_model=List[LookbookItem])
async def admin_list_lookbook(_: User = Depends(require_admin)):
    docs = await db.lookbook.find({}, {"_id": 0}).sort("sort_order", 1).to_list(100)
    return docs


@api_router.post("/admin/lookbook", response_model=LookbookItem)
async def admin_create_lookbook(payload: LookbookCreate, _: User = Depends(require_admin)):
    l = LookbookItem(**payload.model_dump())
    await db.lookbook.insert_one(l.model_dump())
    return l


@api_router.put("/admin/lookbook/{item_id}", response_model=LookbookItem)
async def admin_update_lookbook(item_id: str, payload: LookbookUpdate, _: User = Depends(require_admin)):
    updates = {k: v for k, v in payload.model_dump(exclude_none=True).items()}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    res = await db.lookbook.update_one({"id": item_id}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return await db.lookbook.find_one({"id": item_id}, {"_id": 0})


@api_router.delete("/admin/lookbook/{item_id}")
async def admin_delete_lookbook(item_id: str, _: User = Depends(require_admin)):
    res = await db.lookbook.delete_one({"id": item_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"ok": True}


# ============== App ==============
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def on_startup():
    await seed_if_needed()
    logger.info("AXUM API ready. Admin allowlist=%s", ADMIN_EMAILS)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
