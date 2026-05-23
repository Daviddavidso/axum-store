"""AXUM bilingual API + admin tests."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
API = f"{BASE_URL}/api"

# Session tokens are seeded directly into MongoDB before pytest runs (see auth_testing.md)
ADMIN_SESSION = os.environ.get("ADMIN_SESSION_TOKEN", "")
NONADMIN_SESSION = os.environ.get("NONADMIN_SESSION_TOKEN", "")


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_headers():
    if not ADMIN_SESSION:
        pytest.skip("ADMIN_SESSION_TOKEN not provided")
    return {"Authorization": f"Bearer {ADMIN_SESSION}", "Content-Type": "application/json"}


@pytest.fixture(scope="session")
def nonadmin_headers():
    if not NONADMIN_SESSION:
        pytest.skip("NONADMIN_SESSION_TOKEN not provided")
    return {"Authorization": f"Bearer {NONADMIN_SESSION}", "Content-Type": "application/json"}


# ---------- config ----------
def test_config(client):
    r = client.get(f"{API}/config", timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert data["usd_rub_rate"] == 72
    assert data["ru_discount"] == 0.95
    assert "en" in data["supported_languages"] and "ru" in data["supported_languages"]


# ---------- localized products ----------
def test_products_en(client):
    r = client.get(f"{API}/products", params={"lang": "en"}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 8
    p = data[0]
    assert p["currency"] == "USD"
    assert p["price"].startswith("$")
    # name must be ASCII / English; check no cyrillic
    assert all(ord(ch) < 256 for ch in p["name"])


def test_products_ru(client):
    r = client.get(f"{API}/products", params={"lang": "ru"}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 8
    # Find evening dress
    evening = [p for p in data if p["category"] == "ВЕЧЕРНЕЕ"]
    assert len(evening) >= 1
    p = evening[0]
    assert p["currency"] == "RUB"
    assert "₽" in p["price"]
    # Price computed = price_usd * 72 * 0.95. metallic dress usd=520
    # find by name match
    metallic = next((x for x in data if "МЕТАЛЛИЧЕСКОЕ" in x["name"]), None)
    assert metallic is not None
    assert metallic["price_value"] == round(520 * 72 * 0.95)


def test_categories_ru(client):
    r = client.get(f"{API}/products/categories", params={"lang": "ru"}, timeout=20)
    assert r.status_code == 200
    cats = r.json()["categories"]
    assert cats[0] == "ALL"
    assert "ВЕЧЕРНЕЕ" in cats
    assert "КОСТЮМЫ" in cats


def test_categories_en(client):
    r = client.get(f"{API}/products/categories", params={"lang": "en"}, timeout=20)
    assert r.status_code == 200
    cats = r.json()["categories"]
    assert "EVENING" in cats and "TAILORING" in cats


def test_hero_ru(client):
    r = client.get(f"{API}/hero", params={"lang": "ru"}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 3
    # contains cyrillic
    assert any(any('а' <= c.lower() <= 'я' for c in h["headline"]) for h in data)


def test_lookbook_ru(client):
    r = client.get(f"{API}/lookbook", params={"lang": "ru"}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 4
    assert any("Том" in l["title"] for l in data)


# ---------- newsletter regression ----------
def test_newsletter_regression(client):
    email = f"test_{uuid.uuid4().hex[:8]}@axumtest.com"
    r = client.post(f"{API}/newsletter", json={"email": email}, timeout=20)
    assert r.status_code == 200
    assert r.json()["email"] == email


# ---------- admin auth gating ----------
def test_admin_products_unauth(client):
    r = client.get(f"{API}/admin/products", timeout=20)
    assert r.status_code == 401


def test_admin_hero_unauth(client):
    r = client.get(f"{API}/admin/hero", timeout=20)
    assert r.status_code == 401


def test_admin_lookbook_unauth(client):
    r = client.get(f"{API}/admin/lookbook", timeout=20)
    assert r.status_code == 401


def test_admin_forbidden_nonadmin(client, nonadmin_headers):
    r = client.get(f"{API}/admin/products", headers=nonadmin_headers, timeout=20)
    assert r.status_code == 403


# ---------- admin happy path ----------
def test_admin_me(client, admin_headers):
    r = client.get(f"{API}/auth/me", headers=admin_headers, timeout=20)
    assert r.status_code == 200
    me = r.json()
    assert me["email"] == "normuloli@gmail.com"
    assert me["is_admin"] is True


def test_admin_list_products_bilingual(client, admin_headers):
    r = client.get(f"{API}/admin/products", headers=admin_headers, timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    p = data[0]
    for k in ("name_en", "name_ru", "category_en", "category_ru", "price_usd"):
        assert k in p, f"missing {k}"


def test_admin_list_hero_bilingual(client, admin_headers):
    r = client.get(f"{API}/admin/hero", headers=admin_headers, timeout=20)
    assert r.status_code == 200
    h = r.json()[0]
    assert "headline_en" in h and "headline_ru" in h


def test_admin_list_lookbook_bilingual(client, admin_headers):
    r = client.get(f"{API}/admin/lookbook", headers=admin_headers, timeout=20)
    assert r.status_code == 200
    l = r.json()[0]
    assert "title_en" in l and "title_ru" in l


def test_admin_product_crud_and_rub_override(client, admin_headers):
    # Create
    payload = {
        "name_en": "TEST_ADMIN_PRODUCT", "name_ru": "ТЕСТОВЫЙ_АДМИН",
        "description_en": "desc", "description_ru": "описание",
        "category_en": "TEST_CAT", "category_ru": "ТЕСТ_КАТ",
        "price_usd": 100.0,
        "image1": "https://example.com/a.jpg", "image2": "https://example.com/b.jpg",
        "sort_order": 99,
    }
    r = client.post(f"{API}/admin/products", headers=admin_headers, json=payload, timeout=20)
    assert r.status_code == 200, r.text
    created = r.json()
    pid = created["id"]
    assert created["name_en"] == "TEST_ADMIN_PRODUCT"

    # Public RU price = 100 * 72 * 0.95 = 6840
    r2 = client.get(f"{API}/products", params={"lang": "ru"}, timeout=20)
    found = next((p for p in r2.json() if p["id"] == pid), None)
    assert found is not None
    assert found["price_value"] == round(100 * 72 * 0.95)

    # Update with override
    r3 = client.put(
        f"{API}/admin/products/{pid}",
        headers=admin_headers,
        json={"price_rub_override": 9999, "name_en": "TEST_ADMIN_PRODUCT_UPDATED"},
        timeout=20,
    )
    assert r3.status_code == 200
    assert r3.json()["price_rub_override"] == 9999
    assert r3.json()["name_en"] == "TEST_ADMIN_PRODUCT_UPDATED"

    # Verify override is honored on public route
    r4 = client.get(f"{API}/products", params={"lang": "ru"}, timeout=20)
    found2 = next((p for p in r4.json() if p["id"] == pid), None)
    assert found2["price_value"] == 9999

    # Delete
    r5 = client.delete(f"{API}/admin/products/{pid}", headers=admin_headers, timeout=20)
    assert r5.status_code == 200

    # Confirm delete
    r6 = client.get(f"{API}/products", timeout=20)
    assert all(p["id"] != pid for p in r6.json())


def test_admin_hero_crud(client, admin_headers):
    payload = {
        "headline_en": "TEST_HERO_EN", "headline_ru": "ТЕСТ_ГЕРО_РУ",
        "subline_en": "s", "subline_ru": "с",
        "cta_en": "GO", "cta_ru": "ВПЕРЁД",
        "image": "https://example.com/h.jpg", "sort_order": 99,
    }
    r = client.post(f"{API}/admin/hero", headers=admin_headers, json=payload, timeout=20)
    assert r.status_code == 200
    hid = r.json()["id"]
    r2 = client.put(f"{API}/admin/hero/{hid}", headers=admin_headers, json={"headline_en": "TEST_HERO_EN2"}, timeout=20)
    assert r2.status_code == 200 and r2.json()["headline_en"] == "TEST_HERO_EN2"
    r3 = client.delete(f"{API}/admin/hero/{hid}", headers=admin_headers, timeout=20)
    assert r3.status_code == 200


def test_admin_lookbook_crud(client, admin_headers):
    payload = {
        "tab": "TEST_TAB", "title_en": "TEST_LB_EN", "title_ru": "ТЕСТ_ЛБ_РУ",
        "description_en": "d", "description_ru": "д",
        "image": "https://example.com/l.jpg", "sort_order": 99,
    }
    r = client.post(f"{API}/admin/lookbook", headers=admin_headers, json=payload, timeout=20)
    assert r.status_code == 200
    lid = r.json()["id"]
    r2 = client.put(f"{API}/admin/lookbook/{lid}", headers=admin_headers, json={"title_en": "TEST_LB_EN2"}, timeout=20)
    assert r2.status_code == 200 and r2.json()["title_en"] == "TEST_LB_EN2"
    r3 = client.delete(f"{API}/admin/lookbook/{lid}", headers=admin_headers, timeout=20)
    assert r3.status_code == 200
