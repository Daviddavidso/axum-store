"""AXUM — reseed the SHOP catalog with the 2026 'catalog ALL' studio drop.

Wipes ONLY the products collection and inserts the placeholder looks generated in
backend/catalog_seed.py — the 152-photo shoot grouped into one product per
garment, each with an ``images`` array of all its angles (downscaled web copies
under frontend/public/products/catalog/). Hero slides and lookbook are untouched.

Run from the repo root:  python3 scripts/rebuild_catalog_2026.py
"""
import os
import sys
import uuid
from pathlib import Path

from dotenv import load_dotenv
from pymongo import MongoClient

ROOT = Path(__file__).resolve().parent.parent
load_dotenv(ROOT / "backend" / ".env")
# Allow `import catalog_seed` from backend/.
sys.path.insert(0, str(ROOT / "backend"))
from catalog_seed import PLACEHOLDER_PRODUCTS  # noqa: E402

client = MongoClient(os.environ["MONGO_URL"])
db = client[os.environ["DB_NAME"]]

docs = []
for p in PLACEHOLDER_PRODUCTS:
    d = dict(p)
    d["id"] = str(uuid.uuid4())
    d.setdefault("price_rub_override", None)
    docs.append(d)

# Verify every web copy actually exists on disk before wiping anything. Each
# look now carries an ``images`` array (all studio angles), so check them all.
catalog_dir = ROOT / "frontend" / "public" / "products" / "catalog"
missing = [
    src for d in docs
    for src in (d.get("images") or [d["image1"], d["image2"]])
    if not (catalog_dir / Path(src).name).exists()
]
if missing:
    print(f"ABORT: {len(missing)} image files missing, e.g. {missing[:3]}")
    sys.exit(1)

removed = db.products.delete_many({}).deleted_count
db.products.insert_many(docs)

print(f"Removed {removed} old products.")
print(f"Inserted {db.products.count_documents({})} placeholder looks.")
print(f"Hero slides (untouched): {db.hero_slides.count_documents({})}")
print(f"Lookbook items (untouched): {db.lookbook.count_documents({})}")
print("Shop catalog rebuilt with the 2026 'catalog ALL' drop "
      f"({len(docs)} garments grouped from 152 studio photos).")
