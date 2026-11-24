import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Flame,
  ShoppingCart,
  Sparkles,
  Star,
} from "lucide-react";
import { fetchProduct, fetchProductReviews } from "../api/products.api";
import useCart from "../hooks/useCart";
import { getErrorMessage } from "../api/axios";
import { formatPrice } from "../utils/formatPrice";
import Loader from "../components/common/Loader";

const BADGES = {
  new: { label: "NEW", Icon: Sparkles, cls: "bg-mint" },
  best: { label: "BEST SELLER", Icon: Flame, cls: "bg-sun" },
  rare: { label: "RARE", Icon: Star, cls: "bg-sun" },
};

function Stars({ value, size = 16 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          strokeWidth={2}
          className={n <= Math.round(value) ? "fill-sun text-ink" : "text-ink/30"}
        />
      ))}
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [revPage, setRevPage] = useState(1);
  const [revPages, setRevPages] = useState(1);
  const [revLoading, setRevLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchProduct(id)
      .then((d) => !cancelled && setProduct(d))
      .catch((e) => !cancelled && setError(getErrorMessage(e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    fetchProductReviews(id, { page: revPage, limit: 5 })
      .then((d) => {
        if (cancelled) return;
        setReviews((prev) => (revPage === 1 ? d.items : [...prev, ...d.items]));
        setSummary(d.summary);
        setRevPages(d.pages);
      })
      .catch(() => {})
      .finally(() => !cancelled && setRevLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id, revPage]);

  if (loading) return <Loader />;

  if (error || !product) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="font-display text-2xl font-extrabold">{error || "Product not found"}</p>
        <Link to="/products" className="mt-4 inline-block font-extrabold text-violet underline">
          Back to products
        </Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const off =
    product.mrp > product.price ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  const badge = BADGES[product.badge];
  const images = product.images || [];
  const prevImg = () => setActiveImg((i) => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % images.length);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 md:px-8">
      <Link
        to="/products"
        className="mb-4 inline-flex items-center gap-1 text-sm font-extrabold text-ink-soft hover:text-ink"
      >
        <ArrowLeft size={16} strokeWidth={3} /> Back to products
      </Link>

      <div className="grid gap-6 md:grid-cols-2">
        {/* IMAGES */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border-2 border-ink bg-[#FFE4CE] shadow-[4px_4px_0_var(--color-ink)]">
            {images[activeImg] ? (
              <img
                src={images[activeImg]}
                alt={product.title}
                className="h-full w-full object-contain p-4"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-bold text-ink-soft/60">
                No image
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImg}
                  aria-label="Previous image"
                  className="absolute left-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border-2 border-ink bg-cream shadow-[2px_2px_0_var(--color-ink)] hover:bg-sun"
                >
                  <ChevronLeft size={22} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={nextImg}
                  aria-label="Next image"
                  className="absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full border-2 border-ink bg-cream shadow-[2px_2px_0_var(--color-ink)] hover:bg-sun"
                >
                  <ChevronRight size={22} strokeWidth={3} />
                </button>
                <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border-2 border-ink bg-cream px-2.5 py-0.5 text-xs font-extrabold">
                  {activeImg + 1} / {images.length}
                </span>
              </>
            )}
            {badge && (
              <span
                className={`absolute left-3 top-3 flex items-center gap-1 rounded-full border-2 border-ink px-2.5 py-0.5 text-xs font-extrabold text-ink ${badge.cls}`}
              >
                <badge.Icon size={14} strokeWidth={3} />
                {badge.label}
              </span>
            )}
            {off > 0 && (
              <span className="absolute right-3 top-3 rounded-full bg-brand px-2.5 py-0.5 text-xs font-extrabold text-white">
                {off}% OFF
              </span>
            )}
          </div>

          {images.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-[#FFE4CE] ${
                    i === activeImg ? "border-violet" : "border-ink/30"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div>
          <p className="text-xs font-extrabold uppercase text-ink-soft">{product.category}</p>
          <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight">
            {product.title}
          </h1>

          <div className="mt-2 flex items-center gap-2 text-sm font-bold text-ink-soft">
            <Stars value={product.rating} />
            {product.ratingCount > 0 ? (
              <span>
                {product.rating.toFixed(1)} ({product.ratingCount} reviews)
              </span>
            ) : (
              <span>No reviews yet</span>
            )}
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="font-display text-4xl font-extrabold text-brand">
              {formatPrice(product.price)}
            </span>
            {off > 0 && (
              <span className="text-base font-bold text-ink-soft/60 line-through">
                {formatPrice(product.mrp)}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs font-bold text-ink-soft">Shipping charged separately at checkout</p>

          <p
            className={`mt-3 inline-block rounded-full border-2 border-ink px-3 py-0.5 text-xs font-extrabold ${
              outOfStock ? "bg-coral" : "bg-mint"
            }`}
          >
            {outOfStock
              ? "Out of stock"
              : product.stock <= 5
              ? `Only ${product.stock} left`
              : "In stock"}
          </p>

          {product.description && (
            <div className="mt-5">
              <h2 className="mb-1 font-display text-lg font-extrabold">About this product</h2>
              <p className="whitespace-pre-line text-sm font-semibold text-ink-soft">
                {product.description}
              </p>
            </div>
          )}

          <button
            type="button"
            disabled={outOfStock}
            onClick={() => {
              add(product._id);
              setAdded(true);
              setTimeout(() => setAdded(false), 1500);
            }}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-ink bg-violet px-5 py-3 font-extrabold text-white shadow-[3px_3px_0_var(--color-ink)] transition hover:bg-violet-dark active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ShoppingCart size={18} strokeWidth={2.6} /> {added ? "Added to cart" : "Add to cart"}
          </button>
        </div>
      </div>

      {/* REVIEWS */}
      <section className="mt-12">
        <h2 className="font-display text-2xl font-extrabold">Customer reviews</h2>

        {summary && summary.count > 0 && (
          <div className="mt-4 grid gap-4 rounded-3xl border-2 border-[#F2B1A8] bg-cream p-4 sm:grid-cols-[160px_1fr]">
            <div className="text-center">
              <p className="font-display text-5xl font-extrabold text-brand">{summary.average}</p>
              <div className="mt-1 flex justify-center">
                <Stars value={summary.average} />
              </div>
              <p className="mt-1 text-xs font-bold text-ink-soft">{summary.count} reviews</p>
            </div>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map((n) => {
                const c = summary.breakdown[n] || 0;
                const pct = summary.count ? (c / summary.count) * 100 : 0;
                return (
                  <div key={n} className="flex items-center gap-2 text-xs font-extrabold">
                    <span className="w-4">{n}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full border border-ink/30 bg-peach">
                      <div className="h-full bg-sun" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-6 text-right text-ink-soft">{c}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {revLoading ? (
          <Loader />
        ) : reviews.length === 0 ? (
          <p className="mt-4 rounded-3xl border-2 border-dashed border-ink/30 p-8 text-center font-bold text-ink-soft">
            No reviews yet. Reviews appear after customers receive their orders.
          </p>
        ) : (
          <div className="mt-4 space-y-3">
            {reviews.map((r) => (
              <article key={r._id} className="rounded-2xl border-2 border-[#F2B1A8] bg-cream p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-sun text-sm font-extrabold">
                      {r.name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-extrabold">{r.name}</p>
                      <Stars value={r.rating} size={13} />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-ink-soft">
                    {new Date(r.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {r.text && <p className="mt-2 text-sm font-semibold text-ink-soft">{r.text}</p>}
                {r.videoUrl && (
                  <video
                    controls
                    src={r.videoUrl}
                    className="mt-3 max-h-64 rounded-xl border-2 border-ink"
                  />
                )}
              </article>
            ))}

            {revPage < revPages && (
              <button
                onClick={() => setRevPage((p) => p + 1)}
                className="mx-auto block rounded-xl border-2 border-ink bg-cream px-5 py-2 text-sm font-extrabold shadow-[3px_3px_0_var(--color-ink)] hover:bg-peach active:translate-y-0.5 active:shadow-none"
              >
                Load more reviews
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}