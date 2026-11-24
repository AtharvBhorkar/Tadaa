import { useEffect, useState } from "react";
import { adminGetOrders, adminUpdateOrderApi } from "../../api/admin.api";
import { getErrorMessage } from "../../api/axios";
import { formatPrice } from "../../utils/formatPrice";
import Loader from "../../components/common/Loader";

const TABS = [
  { key: "", label: "All" },
  { key: "paid", label: "To order" },
  { key: "ordered", label: "To ship" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "pending_payment", label: "Unpaid" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_CLS = {
  pending_payment: "bg-sun",
  paid: "bg-coral",
  ordered: "bg-sand",
  shipped: "bg-lilac",
  delivered: "bg-mint",
  cancelled: "bg-peach",
};

const inputClass =
  "rounded-xl border-2 border-ink/30 bg-cream px-3 py-2 text-sm font-bold outline-none focus:border-violet";
const btn =
  "rounded-xl border-2 border-ink px-4 py-2 text-sm font-extrabold shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-none disabled:opacity-50";

const fmtDate = (d) =>
  new Date(d).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

function OrderCard({ order, busy, onUpdate }) {
  const [tracking, setTracking] = useState(order.trackingId || "");
  const [cancelOpen, setCancelOpen] = useState(false);
  const [reason, setReason] = useState("");
  const words = reason.trim().split(/\s+/).filter(Boolean).length;
  const itemMargin = order.subtotal - order.cost;

  const submitCancel = () => {
    if (words < 6) return;
    onUpdate(order._id, { status: "cancelled", reason: reason.trim() });
  };

  return (
    <article className="rounded-3xl border-2 border-ink bg-cream p-4 shadow-[4px_4px_0_var(--color-ink)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-display text-lg font-extrabold">
            #{String(order._id).slice(-8).toUpperCase()}
          </p>
          <p className="text-xs font-bold text-ink-soft">{fmtDate(order.createdAt)}</p>
        </div>
        <span
          className={`rounded-full border-2 border-ink px-3 py-0.5 text-xs font-extrabold ${STATUS_CLS[order.status]}`}
        >
          {order.status.replace("_", " ")}
        </span>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <div className="text-sm font-bold">
          <p className="font-extrabold">{order.user?.name || order.address.name}</p>
          <p className="text-ink-soft">{order.user?.email}</p>
          <p className="mt-1">
            {order.address.name}, {order.address.phone}
          </p>
          <p className="text-ink-soft">
            {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ""}, {order.address.city},{" "}
            {order.address.state} - {order.address.pincode}
          </p>
        </div>

        <ul className="space-y-1.5">
          {order.items.map((i) => (
            <li key={i.product} className="flex items-center gap-2 text-sm font-bold">
              {i.image && (
                <img src={i.image} alt="" className="h-9 w-9 rounded-lg border-2 border-ink/20 object-cover" />
              )}
              <span className="min-w-0 flex-1 truncate">
                {i.title} <span className="text-ink-soft">× {i.qty}</span>
              </span>
              <span className="text-xs text-ink-soft">
                {formatPrice(i.price)} / cost {formatPrice(i.costPrice || 0)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t-2 border-ink/20 pt-2 text-sm font-bold">
        <span>Items {formatPrice(order.subtotal)}</span>
        <span>Shipping {formatPrice(order.shipping)}</span>
        <span className="text-brand">Total {formatPrice(order.total)}</span>
        <span className="text-ink-soft">Cost {formatPrice(order.cost)}</span>
        <span className={itemMargin >= 0 ? "text-green-700" : "text-brand"}>
          Item margin {formatPrice(itemMargin)}
        </span>
      </div>

      {order.status === "cancelled" && (
        <div className="mt-3 rounded-xl border-2 border-dashed border-brand bg-peach p-3 text-sm font-bold">
          <p className="text-xs font-extrabold uppercase text-brand">
            Cancelled by{" "}
            {order.cancelledBy === "user"
              ? "user"
              : order.cancelledBy === "admin"
                ? "admin"
                : "(not recorded)"}
            {order.cancelledAt ? ` · ${fmtDate(order.cancelledAt)}` : ""}
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words">
            {order.cancelReason || "No reason recorded."}
          </p>
          {order.paidAt && (
            <p className="mt-1 text-xs text-ink-soft">Customer had paid, refund manually.</p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {order.status === "paid" && (
          <button
            disabled={busy}
            onClick={() => onUpdate(order._id, { status: "ordered" })}
            className={`${btn} bg-violet text-white`}
          >
            Mark as ordered (from supplier)
          </button>
        )}

        {(order.status === "ordered" || order.status === "shipped") && (
          <>
            <input
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              placeholder="Tracking ID"
              className={`${inputClass} w-48`}
            />
            {order.status === "ordered" ? (
              <button
                disabled={busy || !tracking.trim()}
                onClick={() => onUpdate(order._id, { status: "shipped", trackingId: tracking })}
                className={`${btn} bg-violet text-white`}
              >
                Mark shipped
              </button>
            ) : (
              <>
                <button
                  disabled={busy || !tracking.trim() || tracking.trim() === order.trackingId}
                  onClick={() => onUpdate(order._id, { trackingId: tracking })}
                  className={`${btn} bg-cream hover:bg-peach`}
                >
                  Save tracking
                </button>
                <button
                  disabled={busy}
                  onClick={() => onUpdate(order._id, { status: "delivered" })}
                  className={`${btn} bg-violet text-white`}
                >
                  Mark delivered
                </button>
              </>
            )}
          </>
        )}

        {["pending_payment", "paid", "ordered"].includes(order.status) && (
          <button disabled={busy} onClick={() => setCancelOpen((v) => !v)} className={`${btn} ml-auto bg-cream text-brand hover:bg-peach`}>
            Cancel order
          </button>
        )}
      </div>
      {cancelOpen && (
        <div className="mt-3 rounded-xl border-2 border-ink/30 bg-peach p-3">
          <p className="text-xs font-extrabold text-ink-soft">
            This reason will be shown to the customer (minimum 6 words). Stock will be restored.
            {order.status !== "pending_payment" &&
              " Customer has already paid, so refund them manually from the payment gateway."}
          </p>
          <textarea
            rows={3}
            maxLength={500}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Write the cancellation reason..."
            className={`${inputClass} mt-2 w-full`}
          />
          <p className={`mt-1 text-xs font-extrabold ${words >= 6 ? "text-green-700" : "text-brand"}`}>
            {words} / 6 words
          </p>
          <div className="mt-2 flex gap-2">
            <button onClick={() => setCancelOpen(false)} className={`${btn} bg-cream hover:bg-peach`}>
              Close
            </button>
            <button
              disabled={busy || words < 6}
              onClick={submitCancel}
              className={`${btn} bg-brand text-peach`}
            >
              Confirm cancel
            </button>
          </div>
        </div>
      )}
    </article>
  );
}

export default function AdminOrders() {
  const [data, setData] = useState({ orders: [], pages: 1, statusCounts: {} });
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    adminGetOrders({ status: status || undefined, page, limit: 10 })
      .then((d) => !cancelled && setData(d))
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [status, page, tick]);

  const onUpdate = async (id, body) => {
    setBusyId(id);
    setError("");
    try {
      await adminUpdateOrderApi(id, body);
      setTick((t) => t + 1); // reload so counts and filters stay correct
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusyId("");
    }
  };

  const pick = (key) => {
    setStatus(key);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-6 md:px-8">
      <h1 className="font-display text-3xl font-extrabold">Admin: Orders</h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const count = t.key ? data.statusCounts[t.key] || 0 : null;
          return (
            <button
              key={t.key}
              onClick={() => pick(t.key)}
              className={`rounded-full border-2 border-ink px-3 py-1 text-xs font-extrabold ${
                status === t.key ? "bg-violet text-white" : "bg-cream hover:bg-sun"
              }`}
            >
              {t.label}
              {count !== null && ` (${count})`}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="mt-3 rounded-xl border-2 border-brand bg-cream p-3 text-sm font-bold text-brand">
          {error}
        </p>
      )}

      {loading ? (
        <Loader />
      ) : (
        <div className="mt-5 space-y-4">
          {data.orders.map((o) => (
            <OrderCard key={`${o._id}-${o.status}-${o.trackingId}`} order={o} busy={busyId === o._id} onUpdate={onUpdate} />
          ))}
          {!data.orders.length && (
            <p className="rounded-3xl border-2 border-dashed border-coral p-10 text-center font-bold text-ink-soft">
              No orders here.
            </p>
          )}

          {data.pages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className={`${btn} bg-cream`}
              >
                Prev
              </button>
              <span className="text-sm font-extrabold">
                {page} / {data.pages}
              </span>
              <button
                disabled={page >= data.pages}
                onClick={() => setPage((p) => p + 1)}
                className={`${btn} bg-cream`}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}