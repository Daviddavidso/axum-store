// Static demo adapter — lets the AXUM frontend run with NO backend (e.g. on
// GitHub Pages). When REACT_APP_STATIC_DEMO=1, this installs a custom axios
// adapter that serves pre-harvested JSON from /api-static/*.json instead of
// hitting a server. The harvested files mirror the mock API responses, so the
// components receive identical-shaped data and render unchanged. Read-only:
// write endpoints (newsletter, payments, auth) resolve to benign no-ops.
import axios from "axios";

const ENABLED = process.env.REACT_APP_STATIC_DEMO === "1";

// Served at the site root, so PUBLIC_URL is "" — but honour it if set so the
// build also works under a sub-path.
const BASE = process.env.PUBLIC_URL || "";

const _cache = new Map();
async function loadJson(file) {
  if (_cache.has(file)) return _cache.get(file);
  const res = await fetch(`${BASE}/api-static/${file}`);
  if (!res.ok) throw new Error(`static-api: ${file} -> ${res.status}`);
  const data = await res.json();
  _cache.set(file, data);
  return data;
}

const langOf = (config) => {
  const l = (config.params && config.params.lang) || "en";
  return l === "ru" ? "ru" : "en";
};

const ok = (data, config) => ({
  data,
  status: 200,
  statusText: "OK",
  headers: {},
  config,
  request: {},
});

const err = (status, config, detail) => ({
  data: { detail: detail || "not found" },
  status,
  statusText: status === 404 ? "Not Found" : "Error",
  headers: {},
  config,
  request: {},
});

// Resolve a GET against the static dataset. Returns an axios-style response.
async function handleGet(path, config) {
  const lang = langOf(config);

  if (path === "/api" || path === "/api/") return ok({ message: "AXUM static", version: "static" }, config);
  if (path === "/api/config") return ok(await loadJson("config.json"), config);
  if (path === "/api/payments/config") return ok(await loadJson("payments-config.json"), config);
  if (path === "/api/products/categories") return ok(await loadJson(`categories.${lang}.json`), config);
  if (path === "/api/hero") return ok(await loadJson(`hero.${lang}.json`), config);
  if (path === "/api/lookbook") return ok(await loadJson(`lookbook.${lang}.json`), config);

  if (path === "/api/products") {
    const list = await loadJson(`products.${lang}.json`);
    const cat = config.params && config.params.category;
    const filtered = cat && cat !== "ALL" ? list.filter((p) => p.category === cat) : list;
    return ok(filtered, config);
  }

  if (path.startsWith("/api/products/")) {
    const id = path.split("/").pop();
    const list = await loadJson(`products.${lang}.json`);
    const found = list.find((p) => p.id === id);
    return found ? ok(found, config) : err(404, config);
  }

  // Logged-out demo: no session.
  if (path === "/api/auth/me") return err(401, config, "unauthenticated");

  return err(404, config, `static-api: unhandled GET ${path}`);
}

// Write endpoints are inert in the read-only demo.
function handleWrite(path, config) {
  if (path === "/api/newsletter") return ok({ ok: true, demo: true }, config);
  if (path === "/api/auth/logout") return ok({ ok: true }, config);
  if (path.startsWith("/api/auth/")) return ok({ ok: true, demo: true }, config);
  if (path.startsWith("/api/payments/")) return err(503, config, "payments disabled in static demo");
  return ok({ ok: true, demo: true }, config);
}

async function staticAdapter(config) {
  // Strip the configured base + query so we match on the /api/... path only.
  let url = config.url || "";
  try {
    const u = new URL(url, "http://x");
    url = u.pathname;
  } catch (_e) {
    url = url.split("?")[0];
  }
  const idx = url.indexOf("/api/");
  const path = idx >= 0 ? url.slice(idx).replace(/\/$/, "") || "/api" : url;

  const method = (config.method || "get").toLowerCase();
  return method === "get" ? handleGet(path, config) : handleWrite(path, config);
}

if (ENABLED) {
  axios.defaults.adapter = staticAdapter;
  // eslint-disable-next-line no-console
  console.info("[AXUM] static demo mode — serving /api-static/*.json (no backend)");
}

export default ENABLED;
