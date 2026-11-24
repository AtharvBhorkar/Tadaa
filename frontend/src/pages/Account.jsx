import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Check, Package, Star, X } from "lucide-react";
import { createReviewApi } from "../api/products.api";
import useAuth from "../hooks/useAuth";
import useCart from "../hooks/useCart";
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

const MIN_WORDS = 15;

export default function Account() {
  const { user } = useAuth();
  const { count: cartCount } = useCart();
  const [cancelTarget, setCancelTarget] = useState(null);
  const [reason, setReason] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null); // { order, item }
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [notice, setNotice] = useState("");
  const wordCount = reason.trim().split(/\s+/).filter(Boolean).length;
  const [orders, setOrders] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");

  const stats = {
    total: orders.length,
    active: orders.filter((o) => ["pending_payment", "paid", "ordered", "shipped"].includes(o.status)).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const submitReview = async () => {
    if (!reviewTarget || !rating || reviewText.trim().length < 10) return;
    const { order, item } = reviewTarget;
    setBusyId(order._id);
    setError("");
    setNotice("");
    try {
      const d = await createReviewApi(item.product, {
        orderId: order._id,
        rating,
        text: reviewText.trim(),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id ? { ...o, reviewed: [...(o.reviewed || []), String(item.product)] } : o
        )
      );
      setNotice(
        d.pointsEarned
          ? `Thanks for your review! You earned ${d.pointsEarned} points.`
          : "Thanks for your review!"
      );
      setReviewTarget(null);
      setRating(0);
      setReviewText("");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusyId("");
    }
  };

  const submitCancel = async () => {
    if (wordCount < MIN_WORDS || !cancelTarget) return;
    setBusyId(cancelTarget._id);
    setError("");
    try {
      const updated = await cancelOrderApi(cancelTarget._id, reason.trim());
      setOrders((prev) => prev.map((o) => (o._id === updated._id ? updated : o)));
      setCancelTarget(null);
      setReason("");
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setBusyId("");
    }
  };

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
      <h1 className="font-display text-3xl font-extrabold">Account</h1>
      <p className="text-sm font-bold text-ink-soft">
        {user?.name}
        {user?.email ? ` · ${user.email}` : ""}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[
          ["Total orders", stats.total],
          ["Active", stats.active],
          ["Delivered", stats.delivered],
          ["Cancelled", stats.cancelled],
          ["In cart", cartCount],
        ].map(([label, n]) => (
          <div
            key={label}
            className="rounded-2xl border-2 border-ink bg-cream p-3 text-center shadow-[2px_2px_0_var(--color-ink)]"
          >
            <p className="font-display text-2xl font-extrabold text-brand">{n}</p>
            <p className="text-[11px] font-extrabold text-ink-soft">{label}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-6 font-display text-xl font-extrabold">My orders</h2>

      {error && (
        <p className="mt-3 rounded-xl border-2 border-brand bg-cream p-3 text-sm font-bold text-brand">
          {error}
        </p>
      )}

      {notice && (
        <p className="mt-3 rounded-xl border-2 border-ink bg-mint p-3 text-sm font-extrabold">
          {notice}
        </p>
      )}

      {reviewTarget && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4"
          onClick={() => !busyId && setReviewTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-ink bg-cream p-5 shadow-[4px_4px_0_var(--color-ink)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-extrabold">Write a review</h2>
              <button aria-label="Close" onClick={() => setReviewTarget(null)}>
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <p className="mt-1 text-sm font-bold text-ink-soft">{reviewTarget.item.title}</p>

            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" aria-label={`${n} star`} onClick={() => setRating(n)}>
                  <Star
                    size={30}
                    strokeWidth={2}
                    className={n <= rating ? "fill-sun text-ink" : "text-ink/30"}
                  />
                </button>
              ))}
            </div>

            <textarea
              rows={4}
              maxLength={1000}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="How was the product? (minimum 10 characters)"
              className="mt-3 w-full rounded-xl border-2 border-ink/30 bg-cream px-3 py-2 text-sm font-bold outline-none focus:border-violet"
            />
            <p className="mt-1 text-xs font-extrabold text-ink-soft">
              {reviewText.trim().length} / 10 characters minimum
            </p>
            {!reviewTarget.order.reviewed?.length && (
              <p className="mt-1 text-xs font-extrabold text-green-700">
                You will earn 10 points for this order's first review.
              </p>
            )}
            {error && <p className="mt-2 text-sm font-extrabold text-brand">{error}</p>}

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setReviewTarget(null)}
                className="flex-1 rounded-xl border-2 border-ink bg-cream px-4 py-2 text-sm font-extrabold hover:bg-peach"
              >
                Close
              </button>
              <button
                disabled={!rating || reviewText.trim().length < 10 || busyId === reviewTarget.order._id}
                onClick={submitReview}
                className="flex-1 rounded-xl border-2 border-ink bg-violet px-4 py-2 text-sm font-extrabold text-white shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-none disabled:opacity-50"
              >
                Submit review
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div
          className="fixed inset-0 z-[60] grid place-items-center bg-ink/50 p-4"
          onClick={() => !busyId && setCancelTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border-2 border-ink bg-cream p-5 shadow-[4px_4px_0_var(--color-ink)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-xl font-extrabold">
                Cancel order #{String(cancelTarget._id).slice(-8).toUpperCase()}
              </h2>
              <button aria-label="Close" onClick={() => setCancelTarget(null)}>
                <X size={20} strokeWidth={3} />
              </button>
            </div>
            <p className="mt-1 text-sm font-bold text-ink-soft">
              Tell us why you want to cancel (minimum {MIN_WORDS} words).
            </p>
            {cancelTarget.status === "paid" && (
              <p className="mt-2 text-xs font-extrabold text-brand">
                You have already paid. Your refund will be processed by our team.
              </p>
            )}
            <textarea
              rows={4}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Write your reason here..."
              className="mt-3 w-full rounded-xl border-2 border-ink/30 bg-cream px-3 py-2 text-sm font-bold outline-none focus:border-violet"
            />
            <p className={`mt-1 text-xs font-extrabold ${wordCount >= MIN_WORDS ? "text-green-700" : "text-brand"}`}>
              {wordCount} / {MIN_WORDS} words
            </p>
            {error && <p className="mt-2 text-sm font-extrabold text-brand">{error}</p>}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 rounded-xl border-2 border-ink bg-cream px-4 py-2 text-sm font-extrabold hover:bg-peach"
              >
                Keep order
              </button>
              <button
                disabled={wordCount < MIN_WORDS || busyId === cancelTarget._id}
                onClick={submitCancel}
                className="flex-1 rounded-xl border-2 border-ink bg-brand px-4 py-2 text-sm font-extrabold text-peach shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-none disabled:opacity-50"
              >
                Confirm cancel
              </button>
            </div>
          </div>
        </div>
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
                      {o.status === "delivered" &&
                        (o.reviewed?.includes(String(i.product)) ? (
                          <span className="shrink-0 rounded-full border-2 border-ink/30 px-2.5 py-0.5 text-[11px] font-extrabold text-ink-soft">
                            Reviewed ✓
                          </span>
                        ) : (
                          <button
                            onClick={() => {
                              setReviewTarget({ order: o, item: i });
                              setRating(0);
                              setReviewText("");
                              setError("");
                              setNotice("");
                            }}
                            className="shrink-0 rounded-xl border-2 border-ink bg-sun px-2.5 py-1 text-[11px] font-extrabold shadow-[2px_2px_0_var(--color-ink)] active:translate-y-0.5 active:shadow-none"
                          >
                            Write review
                          </button>
                        ))}
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

                {o.status === "cancelled" && o.cancelReason && (
                  <p className="mt-2 rounded-xl border-2 border-dashed border-brand/50 px-3 py-2 text-xs font-bold text-ink-soft">
                    <span className="font-extrabold text-brand">
                      {o.cancelledBy === "admin" ? "Cancelled by Tadaa · Reason: " : "Cancellation reason: "}
                    </span>
                    {o.cancelReason}
                  </p>
                )}

                {["pending_payment", "paid"].includes(o.status) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {o.status === "pending_payment" && config?.devPayment && (
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
                      onClick={() => {
                        setCancelTarget(o);
                        setReason("");
                        setError("");
                      }}
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