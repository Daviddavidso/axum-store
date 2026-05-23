from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import httpx
import uuid
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
    image: str
    sort_order: int = 0


class LookbookCreate(BaseModel):
    tab: str
    title_en: str
    title_ru: str
    description_en: str = ""
    description_ru: str = ""
    image: str
    sort_order: int = 0


class LookbookUpdate(BaseModel):
    tab: Optional[str] = None
    title_en: Optional[str] = None
    title_ru: Optional[str] = None
    description_en: Optional[str] = None
    description_ru: Optional[str] = None
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


def localize_product(p: dict, lang: str) -> dict:
    rub = compute_price_rub(p)
    if lang == "ru":
        return {
            "id": p["id"],
            "name": p.get("name_ru") or p.get("name_en", ""),
            "description": p.get("description_ru") or p.get("description_en", ""),
            "category": p.get("category_ru") or p.get("category_en", ""),
            "price": format_price(rub, "ru"),
            "price_value": rub,
            "currency": "RUB",
            "image1": p["image1"],
            "image2": p["image2"],
            "sort_order": p.get("sort_order", 0),
        }
    return {
        "id": p["id"],
        "name": p.get("name_en", ""),
        "description": p.get("description_en", ""),
        "category": p.get("category_en", ""),
        "price": format_price(p.get("price_usd", 0), "en"),
        "price_value": p.get("price_usd", 0),
        "currency": "USD",
        "image1": p["image1"],
        "image2": p["image2"],
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
    return {
        "id": l["id"],
        "tab": l["tab"],
        "title": l.get(f"title_{lang}") or l.get("title_en", ""),
        "description": l.get(f"description_{lang}") or l.get("description_en", ""),
        "image": l["image"],
        "sort_order": l.get("sort_order", 0),
    }


# ============== Seed (authentic catalog) ==============
# Stable customer-assets URLs of the 10 authentic photos.
_A = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/xraxme3l_DSC04491.jpg"
_B = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/vzl0kizr_DSC05434.jpg"
_C = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/ek3t4h9v_DSC05565.jpg"
_D = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/10b21ebk_DSC05198.jpg"
_E = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/napn995n_DSC04702.jpg"
_F = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/g7izn8xb_IKS03092.JPG"
_G = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/7fs0ph46_IKS03144.jpg"
_H = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/52fhyxcn_DSC04854.jpg"
_I = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/4tmpush2_DSC04772.jpg"
_J = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/rlu4bxm8_DSC04820.jpg"

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

SEED_PRODUCTS = [
    {"name_en": "PINK ZIP DENIM CORSET", "name_ru": "РОЗОВЫЙ ДЖИНСОВЫЙ КОРСЕТ НА МОЛНИИ",
     "description_en": "Hand-dyed fuchsia cotton-denim corset with frayed hem and exposed central zip. Cut close to the body, finished by hand.",
     "description_ru": "Корсет из хлопкового денима ручного окрашивания цвета фуксии с необработанным краем и открытой молнией спереди. Выкроен по фигуре, отделан вручную.",
     "category_en": "READY-TO-WEAR", "category_ru": "ПРЕТ-А-ПОРТЕ",
     "price_usd": 295, "price_rub_override": None, "image1": _F, "image2": _G, "sort_order": 0},
    {"name_en": "MAGENTA CARGO TWO-PIECE", "name_ru": "МАЛИНОВЫЙ КАРГО-КОМПЛЕКТ",
     "description_en": "Acid-washed magenta cotton-twill set: strapless bustier with exposed zip and matching low-rise cargo trouser with detachable chain.",
     "description_ru": "Комплект из малинового хлопкового твила с эффектом «варёнка»: бюстье на молнии и широкие карго-брюки с заниженной талией и съёмной цепочкой.",
     "category_en": "READY-TO-WEAR", "category_ru": "ПРЕТ-А-ПОРТЕ",
     "price_usd": 580, "price_rub_override": None, "image1": _D, "image2": _F, "sort_order": 1},
    {"name_en": "GREY WASH DENIM ZIP BUSTIER", "name_ru": "СЕРЫЙ ДЖИНСОВЫЙ КОРСЕТ НА МОЛНИИ",
     "description_en": "Washed-grey denim bustier with raw-cut hems and centre-front exposed zip. Styled here over a ruched black jersey mini.",
     "description_ru": "Бюстье из стираного серого денима с необработанными краями и открытой молнией спереди. На образе — поверх драпированной чёрной мини-юбки.",
     "category_en": "READY-TO-WEAR", "category_ru": "ПРЕТ-А-ПОРТЕ",
     "price_usd": 360, "price_rub_override": None, "image1": _A, "image2": _E, "sort_order": 2},
    {"name_en": "IVORY CANVAS BUSTIER", "name_ru": "БЕЛЫЙ ХОЛЩОВЫЙ КОРСЕТ",
     "description_en": "Sculpted ivory canvas bustier with frayed hem and exposed central zip. Worn here with black wide-leg trouser; back view shown with our pleated mini and waist chain.",
     "description_ru": "Скульптурное бюстье из небелёного холста с необработанным краем и открытой молнией спереди. На образе — с чёрными широкими брюками; вид сзади — с плиссированной мини-юбкой и цепочкой.",
     "category_en": "READY-TO-WEAR", "category_ru": "ПРЕТ-А-ПОРТЕ",
     "price_usd": 420, "price_rub_override": None, "image1": _C, "image2": _B, "sort_order": 3},
    {"name_en": "LILAC LACE-UP CORSET", "name_ru": "ЛИЛОВЫЙ КОРСЕТ НА ШНУРОВКЕ",
     "description_en": "Lilac washed-denim corset with brass eyelets and contrast lace-up panel. Designed to wear with our black ruched mini.",
     "description_ru": "Корсет из лилового стираного денима с латунными люверсами и контрастной шнуровкой. Создан для пары с нашей чёрной драпированной мини-юбкой.",
     "category_en": "ARCHIVE", "category_ru": "АРХИВ",
     "price_usd": 390, "price_rub_override": None, "image1": _E, "image2": _A, "sort_order": 4},
    {"name_en": "OBSIDIAN HOODED ROMPER", "name_ru": "ОБСИДИАН — КОМБИНЕЗОН С КАПЮШОНОМ",
     "description_en": "Stretch-jersey hooded zip top with attached low-rise short. Body-skimming cut, finger-loop sleeves. Knee-high lace-up leather boots sold separately.",
     "description_ru": "Зип-топ из эластичного трикотажа с капюшоном и низко-посаженным шортиком. Облегающий крой, прорези для пальцев на рукавах. Ботфорты-шнуровка продаются отдельно.",
     "category_en": "READY-TO-WEAR", "category_ru": "ПРЕТ-А-ПОРТЕ",
     "price_usd": 260, "price_rub_override": None, "image1": _I, "image2": _J, "sort_order": 5},
    {"name_en": "OBSIDIAN ZIP HOOD & WIDE-LEG SET", "name_ru": "ОБСИДИАН — ХУДИ НА МОЛНИИ И ШИРОКИЕ БРЮКИ",
     "description_en": "Two-piece: a fitted stretch-jersey hooded zip top and low-rise wide-leg jersey trouser. Worn together as a column of pure black.",
     "description_ru": "Комплект: облегающий зип-топ из трикотажа с капюшоном и широкие трикотажные брюки с заниженной талией. Носится как единая чёрная колонна.",
     "category_en": "READY-TO-WEAR", "category_ru": "ПРЕТ-А-ПОРТЕ",
     "price_usd": 480, "price_rub_override": None, "image1": _H, "image2": _I, "sort_order": 6},
]
for _p in SEED_PRODUCTS:
    _p["id"] = str(uuid.uuid4())

SEED_LOOKBOOK = [
    {"id": str(uuid.uuid4()), "tab": "EDITORIAL_01",
     "title_en": "Volume 01 — Reverse Anatomy", "title_ru": "Том 01 — Обратная анатомия",
     "description_en": "Architecture seen from behind. Lacing, chain, and pleat as a single line.",
     "description_ru": "Архитектура со спины. Шнуровка, цепь и плиссе как одна линия.",
     "image": _B, "sort_order": 0},
    {"id": str(uuid.uuid4()), "tab": "PINK_COURT_02",
     "title_en": "Volume 02 — Pink Court", "title_ru": "Том 02 — Розовый корт",
     "description_en": "Hand-dyed denim corsetry. A sport ritual, distorted.",
     "description_ru": "Деним ручного окрашивания. Спортивный ритуал, искажённый.",
     "image": _F, "sort_order": 1},
    {"id": str(uuid.uuid4()), "tab": "OBSIDIAN_03",
     "title_en": "Volume 03 — Obsidian", "title_ru": "Том 03 — Обсидиан",
     "description_en": "Hooded jersey, leather lacing, planet-sole boot.",
     "description_ru": "Трикотаж с капюшоном, кожаная шнуровка, ботинок-планета.",
     "image": _J, "sort_order": 2},
    {"id": str(uuid.uuid4()), "tab": "ARCHIVE_04",
     "title_en": "Volume 04 — Lilac Archive", "title_ru": "Том 04 — Лиловый архив",
     "description_en": "Washed lavender denim returns from the 2023 lookbook.",
     "description_ru": "Стираный лавандовый деним возвращается из лукбука 2023.",
     "image": _E, "sort_order": 3},
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
        logging.info("Seeded authentic AXUM catalog (10 photos / 7 products / 3 hero / 4 lookbook).")


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
