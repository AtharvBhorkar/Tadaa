import { useEffect, useState } from "react";
import { Eye, EyeOff, Pencil, Plus, X } from "lucide-react";
import { adminGetProducts, createProductApi, updateProductApi } from "../../api/admin.api";
import { getErrorMessage } from "../../api/axios";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";

const CATEGORIES = [
  "Gadgets",
  "Fashion",
  "Home & Decor",
  "Beauty & Personal Care",
  "Accessories",
  "Stationery",
  "Toys & Games",
];

const EMPTY = {
  title: "",
  description: "",
  price: "",
  mrp: "",
  costPrice: "",
  category: "Gadgets",
  stock: "",
  badge: "",
  images: "",
  deodapLink: "",
  isActive: true,
};

const toForm = (p) => ({
  title: p.title,
  description: p.description || "",
  price: p.price,
  mrp: p.mrp || "",
  costPrice: p.costPrice || "",
  category: p.category,
  stock: p.stock,
  badge: p.badge || "",
  images: (p.images || []).join("\n"),
  deodapLink: p.deodapLink || "",
  isActive: p.isActive,
});

const inputClass =
  "w-full rounded-xl border-2 border-ink/30 bg-cream px-3 py-2 text-sm font-bold outline-none focus:border-violet";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-extrabold text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

export default function AdminProducts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);

  const [editing, setEditing] = useState(null); // null | "new" | product
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    let cancelled = false;
    adminGetProducts()
      .then((d) => !cancelled && setItems(d.items))
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const refresh = () => setTick((t) => t + 1);

  const openNew = () => {
    setForm(EMPTY);
    setFormError("");
    setEditing("new");
  };

  const openEdit = (p) => {
    setForm(toForm(p));
    setFormError("");
    setEditing(p);
  };

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      mrp: Number(form.mrp) || 0,
      costPrice: Number(form.costPrice) || 0,
      category: form.category,
      stock: Number(form.stock) || 0,
      badge: form.badge,
      images: form.images.split("\n").map((s) => s.trim()).filter(Boolean),
      deodapLink: form.deodapLink.trim(),
      isActive: form.isActive,
    };
    try {
      if (editing === "new") await createProductApi(payload);
      else await updateProductApi(editing._id, payload);
      setEditing(null);
      refresh();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p) => {
    try {
      await updateProductApi(p._id, { isActive: !p.isActive });
      refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-6 md:px-8">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Admin: Products</h1>
          <p className="text-sm font-bold text-ink-soft">{items.length} products</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 rounded-xl border-2 border-ink bg-violet px-4 py-2 text-sm font-extrabold text-white shadow-[3px_3px_0_var(--color-ink)] transition hover:bg-violet-dark active:translate-y-0.5 active:shadow-none"
        >
          <Plus size={18} strokeWidth={3} /> Add product
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border-2 border-brand bg-cream p-3 text-sm font-bold text-brand">
          {error}
        </p>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto rounded-3xl border-2 border-[#F2B1A8] bg-cream">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b-2 border-[#F2B1A8] bg-peach text-xs font-extrabold uppercase text-ink-soft">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Category</th>
                <th className="p-3">Price</th>
                <th className="p-3">Cost</th>
                <th className="p-3">Margin</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((p) => {
                const margin = p.price - (p.costPrice || 0);
                return (
                  <tr key={p._id} className={`border-b border-[#F2B1A8]/60 ${p.isActive ? "" : "opacity-50"}`}>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] ? (
                          <img src={p.images[0]} alt="" className="h-12 w-12 rounded-lg border-2 border-ink/20 object-cover" />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-peach" />
                        )}
                        <div>
                          <p className="font-extrabold">{p.title}</p>
                          {p.badge && <p className="text-xs font-bold text-violet">{p.badge}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-bold">{p.category}</td>
                    <td className="p-3 font-extrabold">
                      {formatPrice(p.price)}
                      {p.mrp > p.price && (
                        <span className="ml-1 text-xs text-ink-soft/60 line-through">{formatPrice(p.mrp)}</span>
                      )}
                    </td>
                    <td className="p-3 font-bold">{p.costPrice ? formatPrice(p.costPrice) : "-"}</td>
                    <td className={`p-3 font-extrabold ${margin > 0 ? "text-green-700" : "text-brand"}`}>
                      {p.costPrice ? formatPrice(margin) : "-"}
                    </td>
                    <td className={`p-3 font-bold ${p.stock <= 0 ? "text-brand" : ""}`}>{p.stock}</td>
                    <td className="p-3 text-xs font-extrabold">{p.isActive ? "Live" : "Hidden"}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          aria-label="Edit"
                          className="grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-cream hover:bg-peach"
                        >
                          <Pencil size={16} strokeWidth={2.6} />
                        </button>
                        <button
                          onClick={() => toggleActive(p)}
                          aria-label={p.isActive ? "Hide" : "Show"}
                          className="grid h-9 w-9 place-items-center rounded-lg border-2 border-ink bg-cream hover:bg-peach"
                        >
                          {p.isActive ? <EyeOff size={16} strokeWidth={2.6} /> : <Eye size={16} strokeWidth={2.6} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {!items.length && (
                <tr>
                  <td colSpan={8} className="p-10 text-center font-bold text-ink-soft">
                    Abhi koi product nahi. "Add product" dabaa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* FORM MODAL */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4">
          <form
            onSubmit={onSubmit}
            className="my-6 w-full max-w-2xl space-y-4 rounded-3xl border-2 border-ink bg-peach p-5 shadow-[6px_6px_0_var(--color-ink)]"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-extrabold">
                {editing === "new" ? "Add product" : "Edit product"}
              </h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close">
                <X size={22} strokeWidth={3} />
              </button>
            </div>

            {formError && (
              <p className="rounded-xl border-2 border-brand bg-cream p-3 text-sm font-bold text-brand">
                {formError}
              </p>
            )}

            <Field label="Title *">
              <input required value={form.title} onChange={set("title")} className={inputClass} />
            </Field>

            <Field label="Description">
              <textarea rows={2} value={form.description} onChange={set("description")} className={inputClass} />
            </Field>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Field label="Price (₹) *">
                <input required type="number" min="0" value={form.price} onChange={set("price")} className={inputClass} />
              </Field>
              <Field label="MRP (₹)">
                <input type="number" min="0" value={form.mrp} onChange={set("mrp")} className={inputClass} />
              </Field>
              <Field label="Cost (₹)">
                <input type="number" min="0" value={form.costPrice} onChange={set("costPrice")} className={inputClass} />
              </Field>
              <Field label="Stock">
                <input type="number" min="0" value={form.stock} onChange={set("stock")} className={inputClass} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Category">
                <select value={form.category} onChange={set("category")} className={inputClass}>
                  {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Badge">
                <select value={form.badge} onChange={set("badge")} className={inputClass}>
                  <option value="">None</option>
                  <option value="new">New</option>
                  <option value="best">Best Seller</option>
                  <option value="rare">Rare</option>
                </select>
              </Field>
            </div>

            <Field label="Image URLs (ek line me ek)">
              <textarea rows={3} value={form.images} onChange={set("images")} className={inputClass} />
            </Field>

            <Field label="DeoDap link (sirf tere liye, public nahi dikhta)">
              <input value={form.deodapLink} onChange={set("deodapLink")} className={inputClass} />
            </Field>

            <label className="flex items-center gap-2 text-sm font-extrabold">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="h-4 w-4 accent-violet"
              />
              Live (store pe dikhe)
            </label>

            <div className="flex justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="rounded-xl border-2 border-ink bg-cream px-4 py-2 text-sm font-extrabold hover:bg-sand"
              >
                Cancel
              </button>
              <button
                disabled={saving}
                className="rounded-xl border-2 border-ink bg-violet px-5 py-2 text-sm font-extrabold text-white shadow-[3px_3px_0_var(--color-ink)] hover:bg-violet-dark active:translate-y-0.5 active:shadow-none disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}