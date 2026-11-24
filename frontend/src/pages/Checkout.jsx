import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Truck } from "lucide-react";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
import { fetchProductsByIds } from "../api/products.api";
import { createOrderApi, fetchOrderConfig, payTestApi } from "../api/orders.api";
import { getErrorMessage } from "../api/axios";
import { formatPrice } from "../utils/formatPrice";
import Loader from "../components/common/Loader";

const inputClass =
  "w-full rounded-xl border-2 border-ink/30 bg-cream px-3 py-2 text-sm font-bold outline-none focus:border-violet";

const STATUS_LABEL = {
  pending_payment: "Waiting for payment",
  paid: "Payment received",
  cancelled: "Cancelled",
};

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-extrabold text-ink-soft">{label}</span>
      {children}
    </label>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const { items, clear, maxQty } = useCart();

  const [config, setConfig] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(items.length > 0);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const idKey = items
    .map((i) => i.productId)
    .sort()
    .join(",");

  useEffect(() => {
    let cancelled = false;
    fetchOrderConfig()
      .then((d) => !cancelled && setConfig(d))
      .catch((e) => !cancelled && setError(getErrorMessage(e)));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!idKey) return;
    let cancelled = false;
    fetchProductsByIds(idKey.split(","))
      .then((list) => {
        if (!cancelled) setProducts(Object.fromEntries(list.map((p) => [p._id, p])));
      })
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [idKey]);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const lines = items
    .map((i) => {
      const p = products[i.productId];
      if (!p || !p.isActive || p.stock <= 0) return null;
      return { productId: i.productId, p, qty: Math.min(i.qty, p.stock, maxQty) };
    })
    .filter(Boolean);

  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0);
  const shipping = config?.shippingFee ?? 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const created = await createOrderApi({
        items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
        address: form,
      });
      setOrder(created);
      clear();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const act = async (fn) => {
    setBusy(true);
    setError("");
    try {
      setOrder(await fn(order._id));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;

  // ---------- after the order is created ----------
  if (order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-10">
        <div className="rounded-3xl border-2 border-ink bg-cream p-6 text-center shadow-[4px_4px_0_var(--color-ink)]">
          <CheckCircle2 className="mx-auto text-green-700" size={48} strokeWidth={2.4} />
          <h1 className="mt-2 font-display text-3xl font-extrabold">
            {order.status === "paid" ? "Order confirmed" : "Order created"}
          </h1>
          <p className="text-sm font-bold text-ink-soft">
            Order #{String(order._id).slice(-8).toUpperCase()} · {STATUS_LABEL[order.status]}
          </p>

          <div className="mt-4 space-y-1 border-t-2 border-ink/20 pt-3 text-sm font-bold">
            <div className="flex justify-between">
              <span className="text-ink-soft">Items</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Shipping</span>
              <span>{formatPrice(order.shipping)}</span>
            </div>
            <div className="flex justify-between font-extrabold">
              <span>Total</span>
              <span className="text-brand">{formatPrice(order.total)}</span>
            </div>
          </div>

          {error && <p className="mt-3 text-sm font-extrabold text-brand">{error}</p>}

          {order.status === "pending_payment" && (
            <div className="mt-5 space-y-2">
              {config?.devPayment ? (
                <button
                  disabled={busy}
                  onClick={() => act(payTestApi)}
                  className="w-full rounded-xl border-2 border-ink bg-violet px-5 py-3 font-extrabold text-white shadow-[3px_3px_0_var(--color-ink)] hover:bg-violet-dark active:translate-y-0.5 active:shadow-none disabled:opacity-60"
                >
                  Pay {formatPrice(order.total)} (test mode)
                </button>
              ) : (
                <p className="text-xs font-extrabold text-ink-soft">
                  Online payment will be enabled soon.
                </p>
              )}
              <Link
                to="/account"
                className="block w-full rounded-xl border-2 border-ink bg-cream px-5 py-2.5 text-center text-sm font-extrabold hover:bg-peach"
              >
                View / cancel in Account
              </Link>
            </div>
          )}

          <Link to="/products" className="mt-4 inline-block text-sm font-extrabold text-violet underline">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  // ---------- empty cart ----------
  if (!lines.length) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-extrabold">Nothing to checkout</h1>
        <p className="mt-1 text-sm font-bold text-ink-soft">Your cart has no available items.</p>
        <Link to="/products" className="mt-4 inline-block font-extrabold text-violet underline">
          Shop products
        </Link>
      </div>
    );
  }

  // ---------- checkout form ----------
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
      <h1 className="font-display text-3xl font-extrabold">Checkout</h1>

      <p className="mt-2 inline-flex items-center gap-2 rounded-full border-2 border-ink bg-sun px-3 py-1 text-xs font-extrabold">
        <Truck size={14} strokeWidth={3} /> Flat shipping {config ? formatPrice(shipping) : "..."} per order
      </p>

      {error && (
        <p className="mt-3 rounded-xl border-2 border-brand bg-cream p-3 text-sm font-bold text-brand">
          {error}
        </p>
      )}

      <div className="mt-5 grid gap-6 md:grid-cols-[1fr_320px]">
        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-3xl border-2 border-ink bg-peach p-5 shadow-[4px_4px_0_var(--color-ink)]"
        >
          <h2 className="font-display text-xl font-extrabold">Delivery address</h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Full name">
              <input required value={form.name} onChange={set("name")} className={inputClass} />
            </Field>
            <Field label="Mobile number">
              <input
                required
                inputMode="numeric"
                maxLength={13}
                value={form.phone}
                onChange={set("phone")}
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="House no., building, street">
            <input required value={form.line1} onChange={set("line1")} className={inputClass} />
          </Field>
          <Field label="Area, landmark (optional)">
            <input value={form.line2} onChange={set("line2")} className={inputClass} />
          </Field>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="City">
              <input required value={form.city} onChange={set("city")} className={inputClass} />
            </Field>
            <Field label="State">
              <input required value={form.state} onChange={set("state")} className={inputClass} />
            </Field>
            <Field label="Pincode">
              <input
                required
                inputMode="numeric"
                maxLength={6}
                value={form.pincode}
                onChange={set("pincode")}
                className={inputClass}
              />
            </Field>
          </div>

          <button
            disabled={submitting || !config}
            className="mt-2 w-full rounded-xl border-2 border-ink bg-violet px-5 py-3 font-extrabold text-white shadow-[3px_3px_0_var(--color-ink)] hover:bg-violet-dark active:translate-y-0.5 active:shadow-none disabled:opacity-60"
          >
            {submitting ? "Placing order..." : `Place order · ${formatPrice(subtotal + shipping)}`}
          </button>
        </form>

        <aside className="h-fit rounded-3xl border-2 border-ink bg-cream p-5 shadow-[4px_4px_0_var(--color-ink)]">
          <h2 className="font-display text-xl font-extrabold">Summary</h2>
          <ul className="mt-3 space-y-2">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between gap-2 text-sm font-bold">
                <span className="truncate">
                  {l.p.title} <span className="text-ink-soft">× {l.qty}</span>
                </span>
                <span>{formatPrice(l.p.price * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 space-y-1 border-t-2 border-ink/20 pt-3 text-sm font-bold">
            <div className="flex justify-between">
              <span className="text-ink-soft">Items</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-soft">Shipping</span>
              <span>{config ? formatPrice(shipping) : "..."}</span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <span className="font-extrabold">Total</span>
              <span className="font-display text-2xl font-extrabold text-brand">
                {formatPrice(subtotal + shipping)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}