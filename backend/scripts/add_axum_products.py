#!/usr/bin/env python3
"""Idempotent upsert of the new studio-drop products into the live AXUM catalog.

Why this exists: ``seed_if_needed()`` in server.py only seeds when the whole DB is
empty, so once a store has any products the new looks would never appear. This
script upserts the three new products by a *stable* id, so you can run it as many
times as you like against a populated database without creating duplicates.

Usage (from the backend/ folder, with the same venv the server uses):

    python scripts/add_axum_products.py            # upsert into the DB from .env
    MONGO_URL=... DB_NAME=... python scripts/add_axum_products.py   # override target

The product image paths are relative (/products/...). Make sure the three files in
frontend/public/products/ are deployed alongside the SPA, or swap the paths below
for absolute CDN URLs before running against production.
"""
import asyncio
import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load backend/.env regardless of the current working directory.
ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / ".env")

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.environ.get("DB_NAME", "test_database")

_NEW_BLACK = "/products/axum-black-hooded-zip-set.jpg"
_NEW_PINK = "/products/axum-pink-laceup-cargo.jpg"
_NEW_RED = "/products/axum-red-sheer-slip-dress.jpg"

# Stable ids — re-running upserts the *same* documents instead of duplicating.
NEW_PRODUCTS = [
    {
        "id": "axum-onyx-hooded-zip-set",
        "name_en": "ONYX HOODED ZIP SET",
        "name_ru": "ОНИКС — КОМПЛЕКТ С КАПЮШОНОМ НА МОЛНИИ",
        "description_en": "Black long-sleeve hooded zip-up top with matching high-cut micro-shorts in stretch jersey. Body-skimming cut, studio-finished.",
        "description_ru": "Чёрный топ с капюшоном, длинным рукавом и молнией, с парными микрошортами высокой посадки из эластичного трикотажа. Облегающий крой, студийная отделка.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 320,
        "price_rub_override": None,
        "image1": _NEW_BLACK,
        "image2": _NEW_BLACK,
        "alt2_en": "Black long-sleeve hooded zip-up top with matching high-cut micro-shorts",
        "alt2_ru": "Чёрный топ с капюшоном, длинным рукавом и молнией, с парными микрошортами",
        "sort_order": 0,
    },
    {
        "id": "axum-rose-laceup-denim-set",
        "name_en": "ROSE LACE-UP DENIM SET",
        "name_ru": "РОУЗ — ДЖИНСОВЫЙ КОМПЛЕКТ НА ШНУРОВКЕ",
        "description_en": "Pink denim corset with front lace-up and matching pink cargo trousers. Hand-finished brass eyelets, low-rise cut.",
        "description_ru": "Розовый джинсовый корсет на шнуровке спереди с парными розовыми карго-брюками. Латунные люверсы ручной отделки, заниженная посадка.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 540,
        "price_rub_override": None,
        "image1": _NEW_PINK,
        "image2": _NEW_PINK,
        "alt2_en": "Pink denim corset with front lace-up and matching pink cargo trousers",
        "alt2_ru": "Розовый джинсовый корсет на шнуровке с парными розовыми карго-брюками",
        "sort_order": 1,
    },
    {
        "id": "axum-scarlet-sheer-slip-dress",
        "name_en": "SCARLET SHEER SLIP DRESS",
        "name_ru": "СКАРЛЕТ — ПОЛУПРОЗРАЧНОЕ ПЛАТЬЕ-КОМБИНАЦИЯ",
        "description_en": "Red sheer slip mini dress with thin straps and a bias-cut body. An editorial evening piece.",
        "description_ru": "Красное полупрозрачное мини-платье-комбинация на тонких бретелях, крой по косой. Вечерний образ из съёмки.",
        "category_en": "READY-TO-WEAR",
        "category_ru": "ПРЕТ-А-ПОРТЕ",
        "price_usd": 380,
        "price_rub_override": None,
        "image1": _NEW_RED,
        "image2": _NEW_RED,
        "alt2_en": "Red sheer slip mini dress with thin straps",
        "alt2_ru": "Красное полупрозрачное мини-платье-комбинация на тонких бретелях",
        "sort_order": 2,
    },
]


async def main() -> int:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    try:
        # Fail fast with a clear message if the server is unreachable.
        await client.admin.command("ping")
    except Exception as exc:  # noqa: BLE001 - surface any connection problem
        print(f"Cannot reach MongoDB at {MONGO_URL}: {exc}", file=sys.stderr)
        print("Start MongoDB (or set MONGO_URL/DB_NAME) and re-run.", file=sys.stderr)
        return 1

    upserted = 0
    for product in NEW_PRODUCTS:
        result = await db.products.update_one(
            {"id": product["id"]},
            {"$set": product},
            upsert=True,
        )
        action = "inserted" if result.upserted_id else "updated"
        print(f"  {action}: {product['id']} — {product['name_en']}")
        upserted += 1

    total = await db.products.count_documents({})
    print(f"Done. {upserted} products upserted into '{DB_NAME}'. Catalog now holds {total} products.")
    client.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
