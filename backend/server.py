from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="AXUM API")
api_router = APIRouter(prefix="/api")


# ----------------- Models -----------------
class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    price: str
    category: str = "READY-TO-WEAR"
    image1: str
    image2: str
    sort_order: int = 0


class LookbookItem(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tab: str
    title: str
    image: str
    description: str = ""
    sort_order: int = 0


class HeroSlide(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    headline: str
    subline: str = ""
    cta: str = "SHOP NOW"
    image: str
    sort_order: int = 0


class NewsletterCreate(BaseModel):
    email: EmailStr


class NewsletterEntry(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ----------------- Seed data -----------------
SEED_HERO = [
    HeroSlide(
        headline="A/W 25 — UNCOMPROMISED",
        subline="Volume 04 / The New Silhouette",
        cta="ENTER COLLECTION",
        image="https://customer-assets.emergentagent.com/job_643263bd-c784-4e06-87fb-b91e7fc9b022/artifacts/0jm50sy9_photo_5226647467917515077_y.jpg",
        sort_order=0,
    ),
    HeroSlide(
        headline="PINK COURT EDITORIAL",
        subline="Sport meets couture",
        cta="VIEW LOOKBOOK",
        image="https://customer-assets.emergentagent.com/job_643263bd-c784-4e06-87fb-b91e7fc9b022/artifacts/dpmife4r_photo_5226647467917515076_y.jpg",
        sort_order=1,
    ),
    HeroSlide(
        headline="STUDIO N°01",
        subline="Tailored. Disciplined. Black.",
        cta="SHOP STUDIO",
        image="https://customer-assets.emergentagent.com/job_643263bd-c784-4e06-87fb-b91e7fc9b022/artifacts/y6wn81kb_photo_5226647467917515075_y.jpg",
        sort_order=2,
    ),
]

SEED_PRODUCTS = [
    Product(
        name="STUDDED BELT CROP TOP",
        price="$240",
        category="READY-TO-WEAR",
        image1="https://customer-assets.emergentagent.com/job_643263bd-c784-4e06-87fb-b91e7fc9b022/artifacts/y6wn81kb_photo_5226647467917515075_y.jpg",
        image2="https://images.unsplash.com/photo-1776273920158-510b171e936f?crop=entropy&cs=srgb&fm=jpg&q=85",
        sort_order=0,
    ),
    Product(
        name="METALLIC EVENING DRESS",
        price="$520",
        category="EVENING",
        image1="https://images.pexels.com/photos/16791449/pexels-photo-16791449.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
        image2="https://images.unsplash.com/flagged/photo-1570733117311-d990c3816c47?crop=entropy&cs=srgb&fm=jpg&q=85",
        sort_order=1,
    ),
    Product(
        name="BLACK FASHION DRESS",
        price="$380",
        category="EVENING",
        image1="https://images.pexels.com/photos/15432338/pexels-photo-15432338.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
        image2="https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?crop=entropy&cs=srgb&fm=jpg&q=85",
        sort_order=2,
    ),
    Product(
        name="WHITE BLAZER & SCARF",
        price="$410",
        category="TAILORING",
        image1="https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?crop=entropy&cs=srgb&fm=jpg&q=85",
        image2="https://images.unsplash.com/photo-1601597565151-70c4020dc0e1?crop=entropy&cs=srgb&fm=jpg&q=85",
        sort_order=3,
    ),
    Product(
        name="PINK COURT CORSET",
        price="$680",
        category="ARCHIVE",
        image1="https://customer-assets.emergentagent.com/job_643263bd-c784-4e06-87fb-b91e7fc9b022/artifacts/dpmife4r_photo_5226647467917515076_y.jpg",
        image2="https://images.unsplash.com/photo-1674851993263-823aef958e73?crop=entropy&cs=srgb&fm=jpg&q=85",
        sort_order=4,
    ),
    Product(
        name="CRIMSON SHEER SLIP",
        price="$390",
        category="EVENING",
        image1="https://customer-assets.emergentagent.com/job_643263bd-c784-4e06-87fb-b91e7fc9b022/artifacts/0jm50sy9_photo_5226647467917515077_y.jpg",
        image2="https://images.unsplash.com/photo-1662532577856-e8ee8b138a8b?crop=entropy&cs=srgb&fm=jpg&q=85",
        sort_order=5,
    ),
    Product(
        name="LEATHER HARNESS BELT",
        price="$185",
        category="ACCESSORIES",
        image1="https://images.unsplash.com/photo-1601597565151-70c4020dc0e1?crop=entropy&cs=srgb&fm=jpg&q=85",
        image2="https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?crop=entropy&cs=srgb&fm=jpg&q=85",
        sort_order=6,
    ),
    Product(
        name="ASYMMETRIC TROUSER",
        price="$295",
        category="TAILORING",
        image1="https://images.unsplash.com/photo-1776273920158-510b171e936f?crop=entropy&cs=srgb&fm=jpg&q=85",
        image2="https://images.pexels.com/photos/15432338/pexels-photo-15432338.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=720",
        sort_order=7,
    ),
]

SEED_LOOKBOOK = [
    LookbookItem(
        tab="EDITORIAL_01",
        title="Volume 01 — Silhouettes in Black",
        image="https://customer-assets.emergentagent.com/job_643263bd-c784-4e06-87fb-b91e7fc9b022/artifacts/y6wn81kb_photo_5226647467917515075_y.jpg",
        description="The fundamental shape, stripped of ornament. Studio N°01.",
        sort_order=0,
    ),
    LookbookItem(
        tab="STREETWEAR_02",
        title="Volume 02 — Pink Court",
        image="https://customer-assets.emergentagent.com/job_643263bd-c784-4e06-87fb-b91e7fc9b022/artifacts/dpmife4r_photo_5226647467917515076_y.jpg",
        description="Sport rituals, distorted and recomposed.",
        sort_order=1,
    ),
    LookbookItem(
        tab="AVANT_GARDE_03",
        title="Volume 03 — Crimson Room",
        image="https://customer-assets.emergentagent.com/job_643263bd-c784-4e06-87fb-b91e7fc9b022/artifacts/0jm50sy9_photo_5226647467917515077_y.jpg",
        description="Light is fabric. Silence is structure.",
        sort_order=2,
    ),
    LookbookItem(
        tab="ARCHIVE_04",
        title="Volume 04 — Archive",
        image="https://images.unsplash.com/photo-1613915617430-8ab0fd7c6baf?crop=entropy&cs=srgb&fm=jpg&q=85",
        description="A catalogue of past disciplines.",
        sort_order=3,
    ),
]


async def seed_if_empty():
    if await db.products.count_documents({}) == 0:
        await db.products.insert_many([p.model_dump() for p in SEED_PRODUCTS])
    if await db.lookbook.count_documents({}) == 0:
        await db.lookbook.insert_many([l.model_dump() for l in SEED_LOOKBOOK])
    if await db.hero_slides.count_documents({}) == 0:
        await db.hero_slides.insert_many([h.model_dump() for h in SEED_HERO])


# ----------------- Routes -----------------
@api_router.get("/")
async def root():
    return {"message": "AXUM API", "version": "1.0"}


@api_router.get("/products", response_model=List[Product])
async def list_products(category: Optional[str] = None):
    query = {}
    if category and category.upper() != "ALL":
        query["category"] = category.upper()
    items = await db.products.find(query, {"_id": 0}).sort("sort_order", 1).to_list(200)
    return items


@api_router.get("/products/categories")
async def list_categories():
    cats = await db.products.distinct("category")
    return {"categories": ["ALL"] + sorted(cats)}


@api_router.get("/lookbook", response_model=List[LookbookItem])
async def list_lookbook():
    items = await db.lookbook.find({}, {"_id": 0}).sort("sort_order", 1).to_list(50)
    return items


@api_router.get("/hero", response_model=List[HeroSlide])
async def list_hero():
    items = await db.hero_slides.find({}, {"_id": 0}).sort("sort_order", 1).to_list(20)
    return items


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
    await seed_if_empty()
    logger.info("AXUM API ready.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
