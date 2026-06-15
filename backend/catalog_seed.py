"""AXUM — generated placeholder catalog (2026 'catalog ALL' studio drop).

The client supplied a 152-photo shoot of anonymous DSC files with no garment
names, prices, or descriptions. Many frames are the SAME garment shot from
different angles, so we GROUP the 152 photos into 24 distinct looks — one product
per garment — each carrying an ordered ``images`` array of every angle that was
shot. Front view first (hero + card), the rest are alternate angles surfaced in
the product-page gallery.

Grouping was done by visually clustering the contact sheet in shooting order
(frame number). The names/prices/categories below are honest, descriptive
PLACEHOLDERS derived from what is visible in each photo (colour + silhouette) —
edit them per look in the admin panel to add the real garment name, materials,
and styling notes.

Data model per product:
  * name      -> descriptive placeholder, e.g. "Violet Corset & Ruched Mini"
  * category  -> SETS / DRESSES / STREETWEAR (КОМПЛЕКТЫ / ПЛАТЬЯ / СТРИТВИР)
  * images    -> ordered list of /products/catalog/look-NN-x.jpg (all angles)
  * image1    -> images[0] (card front + hover-swap fallback)
  * image2    -> images[1] (card hover-swap "back" view)
  * alt1/alt2 -> describe the IMAGE (accessibility-lead WCAG 1.1.1 sign-off);
                 the API serializer also emits a per-image localized alt for the
                 gallery (first = garment name, rest = "..., view N").

Both server.py (fresh-DB seed) and scripts/rebuild_catalog_2026.py (live reseed)
import PLACEHOLDER_PRODUCTS from here so the two paths can never drift.
"""

# Category code -> (EN label, RU label).
_CATS = {
    "SETS": ("SETS", "КОМПЛЕКТЫ"),
    "DRESSES": ("DRESSES", "ПЛАТЬЯ"),
    "STREETWEAR": ("STREETWEAR", "СТРИТВИР"),
    "NEWCOLLECTION": ("NEW COLLECTION", "НОВАЯ КОЛЛЕКЦИЯ"),
}

# Each group = one garment. ``photos`` lists the studio frames (NN + a/b) that
# show it, in display order — a clear FRONT view first. Derived by clustering the
# shoot's contact sheet; refine per look in the admin panel.
GROUPS = [
    {"name_en": "Graphite Denim Bustier & Mini", "name_ru": "Графитовый джинсовый бюстье и мини",
     "cat": "SETS", "price": 320,
     "photos": ["01a", "01b", "02a", "02b", "03a", "03b", "04a", "04b", "05b"]},
    {"name_en": "Graphite Denim Bustier & Pleated Skirt", "name_ru": "Графитовый бюстье и плиссированная юбка",
     "cat": "SETS", "price": 320,
     "photos": ["05a", "06a", "06b", "07a", "07b", "08a"]},
    {"name_en": "Violet Corset & Ruched Mini", "name_ru": "Фиолетовый корсет и мини с драпировкой",
     "cat": "SETS", "price": 300,
     "photos": ["08b", "09a", "09b", "10a", "10b", "11a", "11b", "12a", "12b",
                "13a", "13b", "14a", "14b", "15a", "15b", "16a"]},
    {"name_en": "Black Corset & Wide-Leg Cargo", "name_ru": "Чёрный корсет и широкие карго",
     "cat": "SETS", "price": 340,
     "photos": ["16b", "17a", "17b", "18a", "18b", "19a", "19b", "20a", "20b"]},
    {"name_en": "Burgundy Velvet Corset & Cargo", "name_ru": "Бордовый бархатный корсет и карго",
     "cat": "SETS", "price": 360,
     "photos": ["21a", "21b", "22a", "22b", "23a", "23b", "24a", "24b", "25a"]},
    {"name_en": "Black Corset & Pleated Skirt", "name_ru": "Чёрный корсет и плиссированная юбка",
     "cat": "SETS", "price": 300,
     "photos": ["25b", "26a", "26b", "27a", "27b", "28a"]},
    {"name_en": "Crimson Floral Corset & Skirt", "name_ru": "Алый корсет с цветами и юбка",
     "cat": "SETS", "price": 320,
     "photos": ["28b", "29a", "29b", "30a", "30b", "31a"]},
    {"name_en": "Pink Corset & Wide-Leg Trousers", "name_ru": "Розовый корсет и широкие брюки",
     "cat": "SETS", "price": 340,
     "photos": ["31b", "32a", "32b", "33a", "33b", "34a"]},
    {"name_en": "Pink Corset & Pleated Skirt", "name_ru": "Розовый корсет и плиссированная юбка",
     "cat": "SETS", "price": 300,
     "photos": ["34b", "35a", "35b"]},
    {"name_en": "Pink Corset & Black Shorts", "name_ru": "Розовый корсет и чёрные шорты",
     "cat": "SETS", "price": 280,
     "photos": ["36a", "36b", "37a", "37b", "38a", "38b", "39a", "39b", "40a"]},
    {"name_en": "Sequin Bustier & Black Shorts", "name_ru": "Бюстье с пайетками и чёрные шорты",
     "cat": "SETS", "price": 320,
     "photos": ["40b", "41a", "41b", "42a", "42b", "43a", "43b"]},
    {"name_en": "Ivory Corset & Pleated Skirt", "name_ru": "Корсет цвета слоновой кости и плиссе",
     "cat": "SETS", "price": 320,
     "photos": ["44a", "44b", "45a", "45b", "46a"]},
    {"name_en": "Ivory Corset & Wide-Leg Trousers", "name_ru": "Корсет слоновой кости и широкие брюки",
     "cat": "SETS", "price": 340,
     "photos": ["46b", "47a", "47b", "48a", "48b", "49a", "49b", "50a", "50b"]},
    {"name_en": "Onyx Hooded Zip Set", "name_ru": "Комплект «Оникс» с капюшоном на молнии",
     "cat": "STREETWEAR", "price": 260,
     "photos": ["51a", "51b", "52a", "52b", "53a", "53b", "54a", "54b"]},
    {"name_en": "AXUM Oversized Graphic Sweatshirt", "name_ru": "Объёмный свитшот AXUM с принтом",
     "cat": "STREETWEAR", "price": 180,
     "photos": ["55a", "55b", "57b", "58a"]},
    {"name_en": "AXUM Oversized Tee — Pink", "name_ru": "Объёмная футболка AXUM — розовая",
     "cat": "STREETWEAR", "price": 160,
     "photos": ["56a", "56b", "57a", "58b", "59a"]},
    {"name_en": "Cathedral-Print Sweatshirt", "name_ru": "Свитшот с принтом «Собор»",
     "cat": "STREETWEAR", "price": 180,
     "photos": ["59b", "60a", "60b", "61a", "61b"]},
    {"name_en": "Crimson Graphic Tee", "name_ru": "Алая футболка с принтом",
     "cat": "STREETWEAR", "price": 140,
     "photos": ["62a", "62b", "63a", "63b"]},
    {"name_en": "Charcoal Halter Mini Dress", "name_ru": "Графитовое платье-мини на халтере",
     "cat": "DRESSES", "price": 300,
     "photos": ["64a", "64b", "66b"]},
    {"name_en": "Charcoal Halter Maxi Dress", "name_ru": "Графитовое платье-макси на халтере",
     "cat": "DRESSES", "price": 360,
     "photos": ["65a", "65b", "66a"]},
    {"name_en": "Sheer Mesh Slip Dress", "name_ru": "Полупрозрачное платье-комбинация",
     "cat": "DRESSES", "price": 340,
     "photos": ["67a", "67b", "68a", "68b", "69a"]},
    {"name_en": "Blue Denim Corset & Wide Jeans", "name_ru": "Голубой джинсовый корсет и широкие джинсы",
     "cat": "SETS", "price": 320,
     "photos": ["69b", "70a", "70b"]},
    {"name_en": "Blue Denim Corset & Pleated Skirt", "name_ru": "Голубой корсет и плиссированная юбка",
     "cat": "SETS", "price": 300,
     "photos": ["71a", "71b", "72a"]},
    {"name_en": "Blue Denim Corset & Ruched Mini", "name_ru": "Голубой корсет и мини с драпировкой",
     "cat": "SETS", "price": 300,
     "photos": ["72b", "73a", "73b", "74a", "74b", "75a", "75b", "76a", "76b"]},
]


# ---------------------------------------------------------------------------
# NEW COLLECTION — the noir "new collection CATALOG" drop (58 photos). Unlike the
# paired "catalog ALL" set above, these are single DSC frames in shooting order,
# clustered by garment. ``photos`` lists the DSC frame numbers (front first).
# Added as a separate NEW COLLECTION category alongside the existing catalog.
# ---------------------------------------------------------------------------
NEW_GROUPS = [
    {"name_en": "Noir Tank Crop & Ruched Mini", "name_ru": "Чёрный топ-кроп и мини с драпировкой",
     "cat": "NEWCOLLECTION", "price": 320,
     "photos": ["04275", "04278", "04284", "04288", "04306"]},
    {"name_en": "Bell-Sleeve Crop & Flared Trousers", "name_ru": "Кроп с расклёшенным рукавом и брюки-клёш",
     "cat": "NEWCOLLECTION", "price": 360,
     "photos": ["04342", "04353", "04362", "04381", "04407"]},
    {"name_en": "Bell-Sleeve Shrug & Ruched Mini", "name_ru": "Болеро с расклёшенным рукавом и мини",
     "cat": "NEWCOLLECTION", "price": 300,
     "photos": ["04420", "04439", "04449", "04455"]},
    {"name_en": "Halter Bralette & Handkerchief Skirt", "name_ru": "Бралетт-халтер и асимметричная юбка",
     "cat": "NEWCOLLECTION", "price": 300,
     "photos": ["04484", "04514", "04519", "04664"]},
    {"name_en": "Noir Bralette & Ivory Asymmetric Skirt", "name_ru": "Чёрный бралетт и асимметричная юбка цвета слоновой кости",
     "cat": "NEWCOLLECTION", "price": 340,
     "photos": ["04526", "04538", "04596", "04598", "04601"]},
    {"name_en": "Cropped Tee & Tailored Shorts", "name_ru": "Укороченная футболка и шорты",
     "cat": "NEWCOLLECTION", "price": 280,
     "photos": ["04676", "04681", "04707", "04722", "04748", "04751"]},
    {"name_en": "Charcoal Draped Halter & Shorts", "name_ru": "Графитовый драпированный халтер и шорты",
     "cat": "NEWCOLLECTION", "price": 280,
     "photos": ["04764", "04769"]},
    {"name_en": "Hooded Zip Crop & Flared Trousers", "name_ru": "Кроп с капюшоном на молнии и брюки-клёш",
     "cat": "NEWCOLLECTION", "price": 360,
     "photos": ["04772", "04810", "04820", "04831", "04843"]},
    {"name_en": "Long-Sleeve Crop & Asymmetric Skirt", "name_ru": "Кроп с длинным рукавом и асимметричная юбка",
     "cat": "NEWCOLLECTION", "price": 320,
     "photos": ["04847", "04854", "04877", "04893", "04950", "04960"]},
    {"name_en": "Hooded Garter Mini Dress", "name_ru": "Платье-мини с капюшоном и подвязками",
     "cat": "NEWCOLLECTION", "price": 380,
     "photos": ["04911", "04921", "04946", "04963", "04992", "05005",
                "05012", "05020", "05045", "05060"]},
    {"name_en": "Wide Bermuda Shorts", "name_ru": "Широкие бермуды",
     "cat": "NEWCOLLECTION", "price": 240,
     "photos": ["05119", "05159", "05168", "05184", "05202", "05225"]},
]


# ---------------------------------------------------------------------------
# STUDIO 02 drop — second studio + atelier shoot (Aug 2025 Sony raws + iPhone
# frames). Curated by clustering the contact sheet of the new-content drop;
# refine names/prices per look in the admin panel. ``photos`` are full file
# stems under /products/newphone/ (front view first).
# ---------------------------------------------------------------------------
NP_GROUPS = [
    {"name_en": "Charcoal Draped Halter Set", "name_ru": "Графитовый драпированный комплект с лямкой через шею",
     "cat": "SETS", "price": 380,
     "photos": ["AXUM-451", "AXUM-480", "AXUM-345", "AXUM-341", "AXUM-634"]},
    {"name_en": "Noir Ruched Strapless Mini", "name_ru": "Чёрное мини-платье без бретелей с драпировкой",
     "cat": "DRESSES", "price": 320,
     "photos": ["IMG_0041", "IMG_0042", "IMG_0043", "IMG_0044", "IMG_0045"]},
    {"name_en": "Noir Ruffle Strapless Mini", "name_ru": "Чёрное мини-платье без бретелей с воланами",
     "cat": "DRESSES", "price": 320,
     "photos": ["IMG_0049", "IMG_0051", "IMG_0052", "IMG_0053", "IMG_0061", "IMG_0062"]},
    {"name_en": "Noir Laced Bustier & Tailored Shorts", "name_ru": "Чёрное бюстье на шнуровке и приталенные шорты",
     "cat": "SETS", "price": 300,
     "photos": ["IMG_0054", "IMG_0058", "IMG_0059", "IMG_0060"]},
    {"name_en": "Crimson Sequin Strapless Mini", "name_ru": "Алое мини-платье без бретелей с пайетками",
     "cat": "DRESSES", "price": 360,
     "photos": ["IMG_0239"]},
    {"name_en": "Blush Mini Dress", "name_ru": "Розовое мини-платье",
     "cat": "DRESSES", "price": 280,
     "photos": ["IMG_0246"]},
    {"name_en": "Cobalt Pleated Fan Dress", "name_ru": "Кобальтовое плиссированное платье-веер",
     "cat": "DRESSES", "price": 340,
     "photos": ["IMG_3633", "IMG_3616", "IMG_3608", "IMG_3603"]},
]


def _img(code):
    """'01a' -> '/products/catalog/look-01-a.jpg'."""
    return f"/products/catalog/look-{code[:-1]}-{code[-1]}.jpg"


def _img_nc(code):
    """'04275' -> '/products/newcollection/DSC04275.jpg'."""
    return f"/products/newcollection/DSC{code}.jpg"


def _img_np(code):
    """'IMG_0041' -> '/products/newphone/IMG_0041.jpg' (full stem)."""
    return f"/products/newphone/{code}.jpg"


def _build():
    products = []
    i = 0
    for groups, img_fn in ((GROUPS, _img), (NEW_GROUPS, _img_nc), (NP_GROUPS, _img_np)):
        for g in groups:
            i += 1
            products.append(_make(g, i, img_fn))
    return products


def _make(g, i, img_fn):
    cat_en, cat_ru = _CATS[g["cat"]]
    imgs = [img_fn(c) for c in g["photos"]]
    n = len(imgs)
    return {
        "name_en": g["name_en"],
        "name_ru": g["name_ru"],
        # Placeholder copy — replace per look in the admin panel.
        "description_en": (
            f"{g['name_en']} — studio look from the AXUM catalog, shown here "
            f"across {n} angle{'s' if n != 1 else ''}. Placeholder description: "
            "edit this product in the admin panel to add the garment name, "
            "materials, and styling notes."
        ),
        "description_ru": (
            f"{g['name_ru']} — студийный образ из каталога AXUM, показан "
            f"в {n} ракурс{'ах' if n != 1 else 'е'}. Черновое описание: "
            "отредактируйте товар в админ-панели, чтобы добавить название "
            "модели, состав и детали образа."
        ),
        "category_en": cat_en,
        "category_ru": cat_ru,
        "price_usd": g["price"],
        "price_rub_override": None,
        # Ordered angles — front first. The API serializer turns this into a
        # localized [{src, alt}] gallery for the product page.
        "images": imgs,
        # Card front + hover-swap "back" view (image2 falls back to the
        # front when a look has only one photo).
        "image1": imgs[0],
        "image2": imgs[1] if n > 1 else imgs[0],
        # Interim alt text — describes the IMAGE (WCAG 1.1.1). alt1 = front
        # (announced on the card), alt2 = decorative alternate (card hover).
        "alt1_en": g["name_en"],
        "alt1_ru": g["name_ru"],
        "alt2_en": f"{g['name_en']}, alternate view",
        "alt2_ru": f"{g['name_ru']}, другой ракурс",
        "sort_order": i - 1,
    }


PLACEHOLDER_PRODUCTS = _build()
