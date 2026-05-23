"""One-shot: insert AXUM AW25 product drop into MongoDB.
Uses the env that backend uses. Safe to re-run: skips products already present by name_en.
"""
import os, uuid, sys
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / "backend" / ".env")
client = MongoClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

# Stable customer-assets URLs of the 5 supplied photos
A = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/xraxme3l_DSC04491.jpg"  # grey denim zip corset + black mini
B = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/vzl0kizr_DSC05434.jpg"  # ivory corset BACK + cream pleated skirt + chain
C = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/ek3t4h9v_DSC05565.jpg"  # ivory corset FRONT + black wide pants
D = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/10b21ebk_DSC05198.jpg"  # magenta corset + magenta cargo
E = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/napn995n_DSC04702.jpg"  # lilac lace-up corset + black mini

NEW_PRODUCTS = [
    {
        "name_en": "GREY WASH DENIM ZIP BUSTIER",
        "name_ru": "СЕРЫЙ ДЖИНСОВЫЙ КОРСЕТ НА МОЛНИИ",
        "description_en": "A washed-grey denim bustier with raw-cut hems and a centre-front exposed zip. Worn here over a ruched black jersey mini.",
        "description_ru": "Бюстье из стираного серого денима с необработанными краями и открытой молнией спереди. На образе — поверх драпированной чёрной мини-юбки.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 360,
        "price_rub_override": None,
        "image1": A,
        "image2": E,  # alt look — lilac sibling
        "sort_order": 100,
    },
    {
        "name_en": "IVORY CANVAS ZIP BUSTIER",
        "name_ru": "БЕЛЫЙ ХОЛЩОВЫЙ КОРСЕТ НА МОЛНИИ",
        "description_en": "Sculpted ivory canvas bustier with frayed hem and exposed central zip. Front view styled with black wide-leg trousers; back view shown with the matching pleated mini and waist chain.",
        "description_ru": "Скульптурное бюстье из небелёного холста с необработанным краем и открытой молнией спереди. Образ спереди — с чёрными широкими брюками; вид сзади — с плиссированной мини-юбкой и цепочкой на талии.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 420,
        "price_rub_override": None,
        "image1": C,  # front
        "image2": B,  # back (same corset, different bottom)
        "sort_order": 101,
    },
    {
        "name_en": "MAGENTA CARGO TWO-PIECE",
        "name_ru": "МАЛИНОВЫЙ КАРГО-КОМПЛЕКТ",
        "description_en": "Acid-washed magenta cotton twill set: cropped strapless bustier with exposed zip and matching low-rise cargo trousers with detachable chain.",
        "description_ru": "Комплект из малинового хлопкового твила с эффектом «варёнка»: короткое бюстье на молнии и широкие карго-брюки с заниженной талией и съёмной цепочкой.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 580,
        "price_rub_override": None,
        "image1": D,
        "image2": A,  # alt styling reference
        "sort_order": 102,
    },
    {
        "name_en": "LILAC LACE-UP CORSET",
        "name_ru": "ЛИЛОВЫЙ КОРСЕТ НА ШНУРОВКЕ",
        "description_en": "Lilac washed-denim corset with brass eyelets and contrast lace-up panel. Cut to wear with our black ruched mini.",
        "description_ru": "Корсет из лилового стираного денима с латунными люверсами и контрастной шнуровкой. Создан для пары с нашей чёрной драпированной мини-юбкой.",
        "category_en": "ARCHIVE",
        "category_ru": "АРХИВ",
        "price_usd": 390,
        "price_rub_override": None,
        "image1": E,
        "image2": C,  # ivory sibling
        "sort_order": 103,
    },
]

inserted = 0
skipped = 0
for p in NEW_PRODUCTS:
    if db.products.find_one({"name_en": p["name_en"]}):
        skipped += 1
        continue
    p["id"] = str(uuid.uuid4())
    db.products.insert_one(p)
    inserted += 1

print(f"Inserted={inserted} skipped={skipped}")
print(f"Total products now: {db.products.count_documents({})}")
