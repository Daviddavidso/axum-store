"""AXUM API tests - products, hero, lookbook, newsletter"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback: read from frontend env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
    except Exception:
        pass

API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# ---------- root ----------
def test_api_root(client):
    r = client.get(f"{API}/", timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert data.get("message") == "AXUM API"
    assert "version" in data


# ---------- products ----------
def test_list_products(client):
    r = client.get(f"{API}/products", timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 8
    p = data[0]
    for k in ("id", "name", "price", "category", "image1", "image2"):
        assert k in p, f"missing key {k}"


def test_filter_products_evening(client):
    r = client.get(f"{API}/products", params={"category": "EVENING"}, timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert all(p["category"] == "EVENING" for p in data)


def test_filter_products_all(client):
    r = client.get(f"{API}/products", params={"category": "ALL"}, timeout=20)
    assert r.status_code == 200
    assert len(r.json()) >= 8


def test_products_categories(client):
    r = client.get(f"{API}/products/categories", timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert "categories" in data
    cats = data["categories"]
    assert cats[0] == "ALL"
    assert "EVENING" in cats
    assert "TAILORING" in cats


# ---------- hero ----------
def test_hero_list(client):
    r = client.get(f"{API}/hero", timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    for k in ("id", "headline", "image"):
        assert k in data[0]


# ---------- lookbook ----------
def test_lookbook_list(client):
    r = client.get(f"{API}/lookbook", timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 4
    for k in ("id", "tab", "title", "image"):
        assert k in data[0]


# ---------- newsletter ----------
def test_newsletter_create_and_duplicate(client):
    email = f"test_{uuid.uuid4().hex[:8]}@axumtest.com"

    # 1. create new
    r1 = client.post(f"{API}/newsletter", json={"email": email}, timeout=20)
    assert r1.status_code == 200, r1.text
    body = r1.json()
    assert body["email"] == email
    assert "id" in body and "created_at" in body

    # 2. duplicate -> 409
    r2 = client.post(f"{API}/newsletter", json={"email": email}, timeout=20)
    assert r2.status_code == 409
    assert "detail" in r2.json()


def test_newsletter_invalid_email(client):
    r = client.post(f"{API}/newsletter", json={"email": "not-an-email"}, timeout=20)
    assert r.status_code == 422


def test_newsletter_count(client):
    r = client.get(f"{API}/newsletter/count", timeout=20)
    assert r.status_code == 200
    data = r.json()
    assert "count" in data and isinstance(data["count"], int)
