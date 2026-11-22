import { Flame, ShoppingCart, Sparkles, Star } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";

const BADGES = {
  new: { label: "NEW", Icon: Sparkles, cls: "bg-mint" },
  best: { label: "BEST SELLER", Icon: Flame, cls: "bg-sun" },
  rare: { label: "RARE", Icon: Star, cls: "bg-sun" },
};

const formatCount = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : n);

export default function ProductCard({ product }) {
  const outOfStock = product.stock <= 0;
  const off =
    product.mrp > product.price
      ? Math.round((1 - product.price / product.mrp) * 100)
      : 0;
  const badge = BADGES[product.badge];

  return (
    <article className="flex flex-col rounded-3xl border-2 border-[#F2B1A8] bg-cream p-3 shadow-[0_6px_16px_rgba(185,52,40,0.12)] transition hover:-translate-y-1 hover:shadow-[0_10px_22px_rgba(185,52,40,0.2)]">
      <div className="relative aspect-4/3 overflow-hidden rounded-2xl bg-[#FFE4CE]">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-contain p-3"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm font-bold text-ink-soft/60">
            No image
          </div>
        )}

        {badge && (
          <span
            className={`absolute left-2 top-2 flex items-center gap-1 rounded-full border-2 border-ink px-2 py-0.5 text-[10px] font-extrabold text-ink ${badge.cls}`}
          >
            <badge.Icon size={12} strokeWidth={3} />
            {badge.label}
          </span>
        )}

        {off > 0 && (
          <span className="absolute right-2 top-2 rounded-full bg-brand px-2 py-0.5 text-[11px] font-extrabold text-white">
            {off}% OFF
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 grid place-items-center bg-ink/55 font-display text-lg font-extrabold text-white">
            Out of stock
          </div>
        )}
      </div>

      <h3 className="mt-3 line-clamp-1 text-sm font-extrabold text-ink">
        {product.title}
      </h3>

      <div className="mt-0.5 flex min-h-5 items-center gap-1 text-xs font-bold text-ink-soft">
        {product.ratingCount > 0 && (
          <>
            <Star size={13} className="fill-sun text-ink" strokeWidth={2} />
            <span>
              {product.rating.toFixed(1)} ({formatCount(product.ratingCount)})
            </span>
          </>
        )}
      </div>

      <div className="mt-auto flex items-end justify-between pt-1">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl font-extrabold leading-none text-brand">
            {formatPrice(product.price)}
          </span>
          {off > 0 && (
            <span className="text-xs font-bold text-ink-soft/60 line-through">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>

        <button
          type="button"
          disabled={outOfStock}
          aria-label={`Add ${product.title} to cart`}
          className="grid h-10 w-10 place-items-center rounded-xl border-2 border-ink bg-violet text-white shadow-[2px_2px_0_var(--color-ink)] transition hover:bg-violet-dark active:translate-y-0.5 active:shadow-none disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ShoppingCart size={18} strokeWidth={2.6} />
        </button>
      </div>
    </article>
  );
}