"""AXUM — full catalog rebuild with the curated 10-image authentic collection.
Wipes hero_slides, products and lookbook then inserts only the 10 supplied photos.

Image legend:
A DSC04491 grey denim zip bustier + black mini (front, full body)
B DSC05434 ivory corset BACK + cream pleated skirt + chain
C DSC05565 ivory corset FRONT + black wide-leg trouser
D DSC05198 magenta corset + magenta cargo (pink court editorial)
E DSC04702 lilac washed-denim lace-up corset + black mini (white studio)
F IKS03092 pink zip denim corset + black mini (studio close-up)
G IKS03144 pink zip denim corset, campaign with male model (moody studio)
H DSC04854 black hooded zip top + black wide-leg trouser (white studio)
I DSC04772 black hooded zip top + black booty short + lace-up boots (front, hood down)
J DSC04820 black hooded zip top + black booty short + lace-up boots (front, hood up)
"""
import os, uuid
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / "backend" / ".env")
client = MongoClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

A = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/xraxme3l_DSC04491.jpg"
B = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/vzl0kizr_DSC05434.jpg"
C = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/ek3t4h9v_DSC05565.jpg"
D = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/10b21ebk_DSC05198.jpg"
E = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/napn995n_DSC04702.jpg"
F = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/g7izn8xb_IKS03092.JPG"
G = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/7fs0ph46_IKS03144.jpg"
H = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/52fhyxcn_DSC04854.jpg"
I = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/4tmpush2_DSC04772.jpg"
J = "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/rlu4bxm8_DSC04820.jpg"

# -------- HERO (3 most dramatic, full-body / editorial) --------
HERO = [
    {
        "headline_en": "AXUM — PINK COURT",
        "headline_ru": "AXUM — PINK COURT",
        "subline_en": "Volume 04 / The New Silhouette",
        "subline_ru": "Том 04 / Новый силуэт",
        "cta_en": "ENTER COLLECTION",
        "cta_ru": "В КОЛЛЕКЦИЮ",
        "image": G,
        "sort_order": 0,
    },
    {
        "headline_en": "MAGENTA — AGAINST THE LINE",
        "headline_ru": "МАЛИНОВЫЙ — ПРОТИВ ЛИНИИ",
        "subline_en": "Sport meets couture",
        "subline_ru": "Спорт встречает кутюр",
        "cta_en": "SHOP THE EDITION",
        "cta_ru": "СМОТРЕТЬ ВЫПУСК",
        "image": D,
        "sort_order": 1,
    },
    {
        "headline_en": "OBSIDIAN — STUDIO N°02",
        "headline_ru": "ОБСИДИАН — СТУДИЯ №02",
        "subline_en": "Tailored. Disciplined. Black.",
        "subline_ru": "Точный крой. Дисциплина. Чёрный.",
        "cta_en": "SHOP STUDIO",
        "cta_ru": "В СТУДИЮ",
        "image": I,
        "sort_order": 2,
    },
]

# -------- LOOKBOOK (4 volumes, dramatic vertical editorials) --------
LOOKBOOK = [
    {
        "tab": "EDITORIAL_01",
        "title_en": "Volume 01 — Reverse Anatomy",
        "title_ru": "Том 01 — Обратная анатомия",
        "description_en": "Architecture seen from behind. Lacing, chain, and pleat as a single line.",
        "description_ru": "Архитектура со спины. Шнуровка, цепь и плиссе как одна линия.",
        "image": B,
        "sort_order": 0,
    },
    {
        "tab": "PINK_COURT_02",
        "title_en": "Volume 02 — Pink Court",
        "title_ru": "Том 02 — Розовый корт",
        "description_en": "Hand-dyed denim corsetry. A sport ritual, distorted.",
        "description_ru": "Деним ручного окрашивания. Спортивный ритуал, искажённый.",
        "image": F,
        "sort_order": 1,
    },
    {
        "tab": "OBSIDIAN_03",
        "title_en": "Volume 03 — Obsidian",
        "title_ru": "Том 03 — Обсидиан",
        "description_en": "Hooded jersey, leather lacing, planet-sole boot.",
        "description_ru": "Трикотаж с капюшоном, кожаная шнуровка, ботинок-планета.",
        "image": J,
        "sort_order": 2,
    },
    {
        "tab": "ARCHIVE_04",
        "title_en": "Volume 04 — Lilac Archive",
        "title_ru": "Том 04 — Лиловый архив",
        "description_en": "Washed lavender denim returns from the 2023 lookbook.",
        "description_ru": "Стираный лавандовый деним возвращается из лукбука 2023.",
        "image": E,
        "sort_order": 3,
    },
]

# -------- PRODUCTS (7 products, all 10 photos referenced; pricing → RU auto) --------
PRODUCTS = [
    {
        "name_en": "PINK ZIP DENIM CORSET",
        "name_ru": "РОЗОВЫЙ ДЖИНСОВЫЙ КОРСЕТ НА МОЛНИИ",
        "description_en": "Hand-dyed fuchsia cotton-denim corset with frayed hem and exposed central zip. Cut close to the body, finished by hand.",
        "description_ru": "Корсет из хлопкового денима ручного окрашивания цвета фуксии с необработанным краем и открытой молнией спереди. Выкроен по фигуре, отделан вручную.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 295,
        "image1": F,
        "image2": G,
        "sort_order": 0,
    },
    {
        "name_en": "MAGENTA CARGO TWO-PIECE",
        "name_ru": "МАЛИНОВЫЙ КАРГО-КОМПЛЕКТ",
        "description_en": "Acid-washed magenta cotton-twill set: strapless bustier with exposed zip and matching low-rise cargo trouser with detachable chain.",
        "description_ru": "Комплект из малинового хлопкового твила с эффектом «варёнка»: бюстье на молнии и широкие карго-брюки с заниженной талией и съёмной цепочкой.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 580,
        "image1": D,
        "image2": F,
        "sort_order": 1,
    },
    {
        "name_en": "GREY WASH DENIM ZIP BUSTIER",
        "name_ru": "СЕРЫЙ ДЖИНСОВЫЙ КОРСЕТ НА МОЛНИИ",
        "description_en": "Washed-grey denim bustier with raw-cut hems and centre-front exposed zip. Styled here over a ruched black jersey mini.",
        "description_ru": "Бюстье из стираного серого денима с необработанными краями и открытой молнией спереди. На образе — поверх драпированной чёрной мини-юбки.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 360,
        "image1": A,
        "image2": E,
        "sort_order": 2,
    },
    {
        "name_en": "IVORY CANVAS BUSTIER",
        "name_ru": "БЕЛЫЙ ХОЛЩОВЫЙ КОРСЕТ",
        "description_en": "Sculpted ivory canvas bustier with frayed hem and exposed central zip. Worn here with black wide-leg trouser; back view shown with our pleated mini and waist chain.",
        "description_ru": "Скульптурное бюстье из небелёного холста с необработанным краем и открытой молнией спереди. На образе — с чёрными широкими брюками; вид сзади — с плиссированной мини-юбкой и цепочкой.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 420,
        "image1": C,
        "image2": B,
        "sort_order": 3,
    },
    {
        "name_en": "LILAC LACE-UP CORSET",
        "name_ru": "ЛИЛОВЫЙ КОРСЕТ НА ШНУРОВКЕ",
        "description_en": "Lilac washed-denim corset with brass eyelets and contrast lace-up panel. Designed to wear with our black ruched mini.",
        "description_ru": "Корсет из лилового стираного денима с латунными люверсами и контрастной шнуровкой. Создан для пары с нашей чёрной драпированной мини-юбкой.",
        "category_en": "ARCHIVE",
        "category_ru": "АРХИВ",
        "price_usd": 390,
        "image1": E,
        "image2": A,
        "sort_order": 4,
    },
    {
        "name_en": "OBSIDIAN HOODED ROMPER",
        "name_ru": "ОБСИДИАН — КОМБИНЕЗОН С КАПЮШОНОМ",
        "description_en": "Stretch-jersey hooded zip top with attached low-rise short. Body-skimming cut, finger-loop sleeves. Knee-high lace-up leather boots sold separately.",
        "description_ru": "Зип-топ из эластичного трикотажа с капюшоном и низко-посаженным шортиком. Облегающий крой, прорези для пальцев на рукавах. Ботфорты-шнуровка продаются отдельно.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 260,
        "image1": I,
        "image2": J,
        "sort_order": 5,
    },
    {
        "name_en": "OBSIDIAN ZIP HOOD & WIDE-LEG SET",
        "name_ru": "ОБСИДИАН — ХУДИ НА МОЛНИИ И ШИРОКИЕ БРЮКИ",
        "description_en": "Two-piece: a fitted stretch-jersey hooded zip top and low-rise wide-leg jersey trouser. Worn together as a column of pure black.",
        "description_ru": "Комплект: облегающий зип-топ из трикотажа с капюшоном и широкие трикотажные брюки с заниженной талией. Носится как единая чёрная колонна.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 480,
        "image1": H,
        "image2": I,
        "sort_order": 6,
    },
]


def insert_with_id(coll, docs):
    for d in docs:
        d["id"] = str(uuid.uuid4())
        if "price_rub_override" not in d and coll.name == "products":
            d["price_rub_override"] = None
    if docs:
        coll.insert_many(docs)


# Wipe
db.products.delete_many({})
db.hero_slides.delete_many({})
db.lookbook.delete_many({})

# Insert
insert_with_id(db.hero_slides, HERO)
insert_with_id(db.lookbook, LOOKBOOK)
insert_with_id(db.products, PRODUCTS)

print(f"Hero slides: {db.hero_slides.count_documents({})}")
print(f"Lookbook items: {db.lookbook.count_documents({})}")
print(f"Products: {db.products.count_documents({})}")
print("Catalog rebuilt with 10 curated authentic photos.")
