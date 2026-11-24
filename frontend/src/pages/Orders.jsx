import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Package } from "lucide-react";
import { cancelOrderApi, fetchMyOrders, fetchOrderConfig, payTestApi } from "../api/orders.api";
import { getErrorMessage } from "../api/axios";
import { formatPrice } from "../utils/formatPrice";
import Loader from "../components/common/Loader";

const STEPS = [
  { key: "paid", label: "Paid" },
  { key: "ordered", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const BADGES = {
  pending_payment: { label: "Awaiting payment", cls: "bg-sun" },
  paid: { label: "Paid", cls: "bg-mint" },
  ordered: { label: "Processing", cls: "bg-mint" },
  shipped: { label: "Shipped", cls: "bg-lilac" },
  delivered: { label: "Delivered", cls: "bg-mint" },
  cancelled: { label: "Cancelled", cls: "bg-coral" },
};

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

function Tracker({ status }) {
  const idx = STEPS.findIndex((s) => s.key === status);
  return (
    <ol className="mt-4 flex items-center">
      {STEPS.map((s, i) => (
        <li key={s.key} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <span
              className={`grid h-7 w-7 place-items-center rounded-full border-2 border-ink ${
                i <= idx ? "bg-mint" : "bg-cream"
              }`}
            >
              {i <= idx && <Check size={14} strokeWidth={3.5} />}
            </span>
            <span className="mt-1 text-[11px] font-extrabold">{s.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <span className={`mx-1 mb-4 h-0.5 flex-1 ${i < idx ? "bg-ink" : "bg-ink/20"}`} />
          )}
        </li>
      ))}
    </ol>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchMyOrders(), fetchOrderConfig()])
      .then(([list, cfg]) => {
        if (cancelled) return;
        setOrders(list);
        setConfig(cfg);
      })
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const act = async (order, fn) => {
    setBusyId(order._id);
    setError("");
    try {
      const updated = await fn(order._id);
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusyId("");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <h1 className="font-display text-3xl font-extrabold">My orders</h1>

      {error && (
        <p className="mt-3 rounded-xl border-2 border-brand bg-cream p-3 text-sm font-bold text-brand">
          {error}
        </p>
      )}

      {!orders.length ? (
        <div className="mt-10 text-center">
          <Package className="mx-auto text-brand" size={52} strokeWidth={2.2} />
          <p className="mt-2 font-bold text-ink-soft">You haven't placed any orders yet.</p>
          <Link to="/products" className="mt-3 inline-block font-extrabold text-violet underline">
            Shop products
          </Link>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {orders.map((o) => {
            const badge = BADGES[o.status];
            return (
              <article
                key={o._id}
                className="rounded-3xl border-2 border-ink bg-cream p-4 shadow-[4px_4px_0_var(--color-ink)]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-display text-lg font-extrabold">
                      #{String(o._id).slice(-8).toUpperCase()}
                    </p>
                    <p className="text-xs font-bold text-ink-soft">{fmtDate(o.createdAt)}</p>
                  </div>
                  <span className={`rounded-full border-2 border-ink px-3 py-0.5 text-xs font-extrabold ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                {STEPS.some((s) => s.key === o.status) && <Tracker status={o.status} />}

                {o.trackingId && (
                  <p className="mt-3 rounded-xl border-2 border-dashed border-ink/40 px-3 py-2 text-sm font-extrabold">
                    Tracking ID: <span className="select-all text-violet-dark">{o.trackingId}</span>
                  </p>
                )}

                <ul className="mt-3 divide-y divide-[#F2B1A8]/60">
                  {o.items.map((i) => (
                    <li key={i.product} className="flex items-center gap-3 py-2">
                      {i.image ? (
                        <img src={i.image} alt="" className="h-12 w-12 rounded-lg border-2 border-ink/20 object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-peach" />
                      )}
                      <span className="min-w-0 flex-1 truncate text-sm font-extrabold">
                        {i.title} <span className="text-ink-soft">× {i.qty}</span>
                      </span>
                      <span className="text-sm font-bold">{formatPrice(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-2 flex justify-between border-t-2 border-ink/20 pt-2 text-sm font-bold">
                  <span className="text-ink-soft">
                    Items {formatPrice(o.subtotal)} + shipping {formatPrice(o.shipping)}
                  </span>
                  <span className="font-extrabold text-brand">{formatPrice(o.total)}</span>
                </div>

                <p className="mt-2 text-xs font-bold text-ink-soft">
                  Deliver to: {o.address.name}, {o.address.line1}
                  {o.address.line2 ? `, ${o.address.line2}` : ""}, {o.address.city}, {o.address.state} -{" "}
                  {o.address.pincode} · {o.address.phone}
                </p>

                {o.status === "pending_payment" && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {config?.devPayment && (
                      <button
                        disabled={busyId === o._id}
                        onClick={() => act(o, payTestApi)}
                        className="rounded-xl border-2 border-ink bg-violet px-4 py-2 text-sm font-extrabold text-white shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-none disabled:opacity-60"
                      >
                        Pay {formatPrice(o.total)} (test mode)
                      </button>
                    )}
                    <button
                      disabled={busyId === o._id}
                      onClick={() => act(o, cancelOrderApi)}
                      className="rounded-xl border-2 border-ink bg-cream px-4 py-2 text-sm font-extrabold hover:bg-peach disabled:opacity-60"
                    >
                      Cancel order
                    </button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}