import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import Logo from "@/components/Logo";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
const startGoogleLogin = () => {
  const redirectUrl = window.location.origin + "/admin";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
};

const TabBtn = ({ active, onClick, children, testid }) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 text-xs tracking-[0.25em] uppercase axum-ease border border-black ${
      active ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
    }`}
    data-testid={testid}
  >
    {children}
  </button>
);

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="block text-[10px] tracking-[0.3em] uppercase opacity-60 mb-1">{label}</span>
    <input
      {...props}
      className="w-full border border-black px-3 py-2 text-sm bg-white outline-none focus:bg-black focus:text-white axum-ease"
    />
  </label>
);

const Area = ({ label, ...props }) => (
  <label className="block">
    <span className="block text-[10px] tracking-[0.3em] uppercase opacity-60 mb-1">{label}</span>
    <textarea
      {...props}
      rows={3}
      className="w-full border border-black px-3 py-2 text-sm bg-white outline-none focus:bg-black focus:text-white axum-ease"
    />
  </label>
);

const ProductRow = ({ p, onSave, onDelete, computedRub, t: tr }) => {
  const [draft, setDraft] = useState(p);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(p), [p]);

  const dirty = JSON.stringify(draft) !== JSON.stringify(p);
  const usd = Number(draft.price_usd) || 0;
  const autoRub = Math.round(usd * computedRub.rate * computedRub.discount);
  const effectiveRub =
    draft.price_rub_override != null && draft.price_rub_override !== ""
      ? Math.round(Number(draft.price_rub_override))
      : autoRub;

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        ...draft,
        price_usd: Number(draft.price_usd),
        price_rub_override:
          draft.price_rub_override === "" || draft.price_rub_override == null
            ? null
            : Number(draft.price_rub_override),
        sort_order: Number(draft.sort_order || 0),
      };
      const { data } = await axios.put(`${API}/admin/products/${p.id}`, payload, { withCredentials: true });
      onSave(data);
      toast.success("Saved");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-black p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white" data-testid={`product-row-${p.id}`}>
      <div className="md:col-span-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={draft.image1} alt="" className="w-14 h-14 object-cover border border-black" />
          <div className="font-display uppercase text-sm tracking-wider">{draft.name_en || "—"}</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={saving || !dirty}
            onClick={save}
            className="axum-btn disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid={`save-product-${p.id}`}
          >
            {saving ? tr("admin.saving") : tr("admin.save")}
          </button>
          <button
            onClick={() => {
              if (window.confirm(tr("admin.confirm_delete"))) onDelete(p.id);
            }}
            className="border border-black p-2 axum-ease hover:bg-black hover:text-white"
            data-testid={`delete-product-${p.id}`}
            aria-label="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-[10px] tracking-[0.4em] uppercase opacity-70">{tr("admin.english")}</div>
        <Field label={tr("admin.name")} value={draft.name_en} onChange={(e) => setDraft({ ...draft, name_en: e.target.value })} />
        <Area label={tr("admin.description")} value={draft.description_en || ""} onChange={(e) => setDraft({ ...draft, description_en: e.target.value })} />
        <Field label={tr("admin.category")} value={draft.category_en} onChange={(e) => setDraft({ ...draft, category_en: e.target.value.toUpperCase() })} />
      </div>

      <div className="space-y-3">
        <div className="text-[10px] tracking-[0.4em] uppercase opacity-70">{tr("admin.russian")}</div>
        <Field label={tr("admin.name")} value={draft.name_ru} onChange={(e) => setDraft({ ...draft, name_ru: e.target.value })} />
        <Area label={tr("admin.description")} value={draft.description_ru || ""} onChange={(e) => setDraft({ ...draft, description_ru: e.target.value })} />
        <Field label={tr("admin.category")} value={draft.category_ru} onChange={(e) => setDraft({ ...draft, category_ru: e.target.value.toUpperCase() })} />
      </div>

      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-black">
        <Field
          label={tr("admin.price_usd")}
          type="number"
          step="1"
          value={draft.price_usd}
          onChange={(e) => setDraft({ ...draft, price_usd: e.target.value })}
        />
        <Field
          label={tr("admin.price_rub_override")}
          type="number"
          step="1"
          placeholder={String(autoRub)}
          value={draft.price_rub_override ?? ""}
          onChange={(e) => setDraft({ ...draft, price_rub_override: e.target.value })}
        />
        <div>
          <span className="block text-[10px] tracking-[0.3em] uppercase opacity-60 mb-1">{tr("admin.computed_ru_price")}</span>
          <div className="w-full border border-black px-3 py-2 text-sm bg-black text-white font-display" data-testid={`computed-rub-${p.id}`}>
            {effectiveRub.toLocaleString("ru-RU")} ₽
          </div>
        </div>
        <Field
          label={tr("admin.sort_order")}
          type="number"
          value={draft.sort_order ?? 0}
          onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })}
        />
      </div>

      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-black">
        <Field label={tr("admin.image1")} value={draft.image1} onChange={(e) => setDraft({ ...draft, image1: e.target.value })} />
        <Field label={tr("admin.image2")} value={draft.image2} onChange={(e) => setDraft({ ...draft, image2: e.target.value })} />
      </div>
    </div>
  );
};

const HeroRow = ({ h, onSave, onDelete, t: tr }) => {
  const [draft, setDraft] = useState(h);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(h), [h]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(h);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...draft, sort_order: Number(draft.sort_order || 0) };
      const { data } = await axios.put(`${API}/admin/hero/${h.id}`, payload, { withCredentials: true });
      onSave(data);
      toast.success("Saved");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-black p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white" data-testid={`hero-row-${h.id}`}>
      <div className="md:col-span-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={draft.image} alt="" className="w-14 h-14 object-cover border border-black" />
          <div className="font-display uppercase text-sm tracking-wider">{draft.headline_en || "—"}</div>
        </div>
        <div className="flex items-center gap-2">
          <button disabled={saving || !dirty} onClick={save} className="axum-btn disabled:opacity-40" data-testid={`save-hero-${h.id}`}>
            {saving ? tr("admin.saving") : tr("admin.save")}
          </button>
          <button
            onClick={() => { if (window.confirm(tr("admin.confirm_delete"))) onDelete(h.id); }}
            className="border border-black p-2 axum-ease hover:bg-black hover:text-white"
            data-testid={`delete-hero-${h.id}`}
            aria-label="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="space-y-3">
        <div className="text-[10px] tracking-[0.4em] uppercase opacity-70">{tr("admin.english")}</div>
        <Field label={tr("admin.headline")} value={draft.headline_en} onChange={(e) => setDraft({ ...draft, headline_en: e.target.value })} />
        <Field label={tr("admin.subline")} value={draft.subline_en || ""} onChange={(e) => setDraft({ ...draft, subline_en: e.target.value })} />
        <Field label={tr("admin.cta")} value={draft.cta_en || ""} onChange={(e) => setDraft({ ...draft, cta_en: e.target.value })} />
      </div>
      <div className="space-y-3">
        <div className="text-[10px] tracking-[0.4em] uppercase opacity-70">{tr("admin.russian")}</div>
        <Field label={tr("admin.headline")} value={draft.headline_ru} onChange={(e) => setDraft({ ...draft, headline_ru: e.target.value })} />
        <Field label={tr("admin.subline")} value={draft.subline_ru || ""} onChange={(e) => setDraft({ ...draft, subline_ru: e.target.value })} />
        <Field label={tr("admin.cta")} value={draft.cta_ru || ""} onChange={(e) => setDraft({ ...draft, cta_ru: e.target.value })} />
      </div>
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-black">
        <Field label={tr("admin.image")} value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
        <Field label={tr("admin.sort_order")} type="number" value={draft.sort_order ?? 0} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })} />
      </div>
    </div>
  );
};

const LookbookRow = ({ l, onSave, onDelete, t: tr }) => {
  const [draft, setDraft] = useState(l);
  const [saving, setSaving] = useState(false);
  useEffect(() => setDraft(l), [l]);
  const dirty = JSON.stringify(draft) !== JSON.stringify(l);

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...draft, sort_order: Number(draft.sort_order || 0) };
      const { data } = await axios.put(`${API}/admin/lookbook/${l.id}`, payload, { withCredentials: true });
      onSave(data);
      toast.success("Saved");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="border border-black p-5 grid grid-cols-1 md:grid-cols-2 gap-5 bg-white" data-testid={`lookbook-row-${l.id}`}>
      <div className="md:col-span-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={draft.image} alt="" className="w-14 h-14 object-cover border border-black" />
          <div className="font-display uppercase text-sm tracking-wider">{draft.title_en || draft.tab}</div>
        </div>
        <div className="flex items-center gap-2">
          <button disabled={saving || !dirty} onClick={save} className="axum-btn disabled:opacity-40" data-testid={`save-lookbook-${l.id}`}>
            {saving ? tr("admin.saving") : tr("admin.save")}
          </button>
          <button
            onClick={() => { if (window.confirm(tr("admin.confirm_delete"))) onDelete(l.id); }}
            className="border border-black p-2 axum-ease hover:bg-black hover:text-white"
            data-testid={`delete-lookbook-${l.id}`}
            aria-label="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      <div className="md:col-span-2">
        <Field label={tr("admin.tab_key")} value={draft.tab} onChange={(e) => setDraft({ ...draft, tab: e.target.value })} />
      </div>
      <div className="space-y-3">
        <div className="text-[10px] tracking-[0.4em] uppercase opacity-70">{tr("admin.english")}</div>
        <Field label={tr("admin.title_field")} value={draft.title_en} onChange={(e) => setDraft({ ...draft, title_en: e.target.value })} />
        <Area label={tr("admin.description")} value={draft.description_en || ""} onChange={(e) => setDraft({ ...draft, description_en: e.target.value })} />
      </div>
      <div className="space-y-3">
        <div className="text-[10px] tracking-[0.4em] uppercase opacity-70">{tr("admin.russian")}</div>
        <Field label={tr("admin.title_field")} value={draft.title_ru} onChange={(e) => setDraft({ ...draft, title_ru: e.target.value })} />
        <Area label={tr("admin.description")} value={draft.description_ru || ""} onChange={(e) => setDraft({ ...draft, description_ru: e.target.value })} />
      </div>
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-black">
        <Field label={tr("admin.image")} value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
        <Field label={tr("admin.sort_order")} type="number" value={draft.sort_order ?? 0} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })} />
      </div>
    </div>
  );
};

const AdminPage = ({ t }) => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [hero, setHero] = useState([]);
  const [lookbook, setLookbook] = useState([]);
  const [config, setConfig] = useState({ usd_rub_rate: 72, ru_discount: 0.95 });

  const loadAll = useCallback(async () => {
    try {
      const [p, h, l, c] = await Promise.all([
        axios.get(`${API}/admin/products`, { withCredentials: true }),
        axios.get(`${API}/admin/hero`, { withCredentials: true }),
        axios.get(`${API}/admin/lookbook`, { withCredentials: true }),
        axios.get(`${API}/config`),
      ]);
      setProducts(p.data);
      setHero(h.data);
      setLookbook(l.data);
      setConfig(c.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (user?.is_admin) loadAll();
  }, [user, loadAll]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-display uppercase tracking-[0.3em] text-sm">
        …
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <Logo tone="black" height={56} className="mb-8" />
        <div className="font-display text-xl md:text-2xl uppercase mb-8 tracking-[0.3em] opacity-70">{t("admin.title")}</div>
        <button onClick={startGoogleLogin} className="axum-btn" data-testid="admin-google-signin">
          {t("admin.sign_in")}
        </button>
        <button onClick={() => navigate("/")} className="mt-6 axum-link" data-testid="admin-back-to-site">
          {t("admin.back_to_site")}
        </button>
      </div>
    );
  }

  if (!user.is_admin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="font-display text-3xl uppercase mb-4">403</div>
        <p className="max-w-md text-sm" data-testid="admin-forbidden">{t("admin.forbidden")}</p>
        <button onClick={logout} className="axum-btn mt-6" data-testid="admin-logout-forbidden">{t("admin.sign_out")}</button>
      </div>
    );
  }

  const onProductSave = (saved) => setProducts((arr) => arr.map((p) => (p.id === saved.id ? saved : p)));
  const onProductDelete = async (id) => {
    try {
      await axios.delete(`${API}/admin/products/${id}`, { withCredentials: true });
      setProducts((arr) => arr.filter((p) => p.id !== id));
      toast.success("Deleted");
    } catch (e) { toast.error("Delete failed"); }
  };
  const onHeroSave = (saved) => setHero((arr) => arr.map((p) => (p.id === saved.id ? saved : p)));
  const onHeroDelete = async (id) => {
    try {
      await axios.delete(`${API}/admin/hero/${id}`, { withCredentials: true });
      setHero((arr) => arr.filter((p) => p.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  };
  const onLookbookSave = (saved) => setLookbook((arr) => arr.map((p) => (p.id === saved.id ? saved : p)));
  const onLookbookDelete = async (id) => {
    try {
      await axios.delete(`${API}/admin/lookbook/${id}`, { withCredentials: true });
      setLookbook((arr) => arr.filter((p) => p.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Delete failed"); }
  };

  const addProduct = async () => {
    try {
      const { data } = await axios.post(
        `${API}/admin/products`,
        {
          name_en: "NEW PRODUCT",
          name_ru: "НОВЫЙ ТОВАР",
          description_en: "",
          description_ru: "",
          category_en: "READY-TO-WEAR",
          category_ru: "ПРЕТ-А-ПОРТЕ",
          price_usd: 100,
          image1: "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/4tmpush2_DSC04772.jpg",
          image2: "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/rlu4bxm8_DSC04820.jpg",
          sort_order: products.length,
        },
        { withCredentials: true }
      );
      setProducts((arr) => [...arr, data]);
    } catch (e) { toast.error("Create failed"); }
  };

  const addHero = async () => {
    try {
      const { data } = await axios.post(
        `${API}/admin/hero`,
        {
          headline_en: "NEW HEADLINE",
          headline_ru: "НОВЫЙ ЗАГОЛОВОК",
          subline_en: "",
          subline_ru: "",
          cta_en: "SHOP NOW",
          cta_ru: "СМОТРЕТЬ",
          image: "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/4tmpush2_DSC04772.jpg",
          sort_order: hero.length,
        },
        { withCredentials: true }
      );
      setHero((arr) => [...arr, data]);
    } catch { toast.error("Create failed"); }
  };

  const addLookbook = async () => {
    try {
      const { data } = await axios.post(
        `${API}/admin/lookbook`,
        {
          tab: `VOLUME_${lookbook.length + 1}`,
          title_en: "New Volume",
          title_ru: "Новый том",
          description_en: "",
          description_ru: "",
          image: "https://customer-assets.emergentagent.com/job_axum-stark/artifacts/vzl0kizr_DSC05434.jpg",
          sort_order: lookbook.length,
        },
        { withCredentials: true }
      );
      setLookbook((arr) => [...arr, data]);
    } catch { toast.error("Create failed"); }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="admin-dashboard">
      <header className="flex items-center justify-between px-5 md:px-8 py-4 axum-border-b">
        <div className="flex items-center gap-4">
          <Logo tone="black" height={26} />
          <span className="hidden md:inline text-xs tracking-[0.3em] uppercase opacity-50">{t("admin.title")}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] tracking-[0.25em] uppercase opacity-70 hidden md:inline" data-testid="admin-user-email">
            {t("admin.welcome")} {user.email}
          </span>
          <button onClick={() => navigate("/")} className="axum-link" data-testid="admin-back-link">
            {t("admin.back_to_site")}
          </button>
          <button onClick={async () => { await logout(); navigate("/"); }} className="axum-btn" data-testid="admin-logout">
            {t("admin.sign_out")}
          </button>
        </div>
      </header>

      <div className="px-5 md:px-8 py-6 axum-border-b flex flex-wrap items-center gap-3" data-testid="admin-tabs">
        <TabBtn active={tab === "products"} onClick={() => setTab("products")} testid="admin-tab-products">
          {t("admin.products")} ({products.length})
        </TabBtn>
        <TabBtn active={tab === "hero"} onClick={() => setTab("hero")} testid="admin-tab-hero">
          {t("admin.hero")} ({hero.length})
        </TabBtn>
        <TabBtn active={tab === "lookbook"} onClick={() => setTab("lookbook")} testid="admin-tab-lookbook">
          {t("admin.lookbook")} ({lookbook.length})
        </TabBtn>
        <div className="ml-auto text-[11px] tracking-[0.25em] uppercase opacity-70">
          USD→RUB: {config.usd_rub_rate} · −{Math.round((1 - config.ru_discount) * 100)}%
        </div>
      </div>

      <div className="px-5 md:px-8 py-8 space-y-5">
        <div className="flex justify-end">
          <button
            onClick={tab === "products" ? addProduct : tab === "hero" ? addHero : addLookbook}
            className="axum-btn"
            data-testid="admin-add-new"
          >
            {t("admin.add_new")}
          </button>
        </div>

        {tab === "products" && (
          <div className="space-y-4">
            {products.map((p) => (
              <ProductRow
                key={p.id}
                p={p}
                onSave={onProductSave}
                onDelete={onProductDelete}
                computedRub={{ rate: config.usd_rub_rate, discount: config.ru_discount }}
                t={t}
              />
            ))}
          </div>
        )}
        {tab === "hero" && (
          <div className="space-y-4">
            {hero.map((h) => (
              <HeroRow key={h.id} h={h} onSave={onHeroSave} onDelete={onHeroDelete} t={t} />
            ))}
          </div>
        )}
        {tab === "lookbook" && (
          <div className="space-y-4">
            {lookbook.map((l) => (
              <LookbookRow key={l.id} l={l} onSave={onLookbookSave} onDelete={onLookbookDelete} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
