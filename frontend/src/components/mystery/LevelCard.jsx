import { Gift } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";

export default function LevelCard({ level, selected, tone, onSelect }) {
  const empty = level.prizes.length === 0;

  return (
    <button
      type="button"
      onClick={() => onSelect(level._id)}
      disabled={empty}
      className={`flex flex-col rounded-3xl border-2 border-ink p-5 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
        selected
          ? "-translate-y-1 bg-cream shadow-[6px_6px_0_var(--color-violet)]"
          : "bg-cream shadow-[4px_4px_0_var(--color-ink)] hover:-translate-y-1"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`rounded-full border-2 border-ink px-3 py-0.5 text-xs font-extrabold ${tone}`}>
          {level.tagline || level.name}
        </span>
        <Gift className="text-brand" size={26} strokeWidth={2.6} />
      </div>
      <h3 className="mt-3 font-display text-2xl font-extrabold">{level.name}</h3>
      <p className="font-display text-4xl font-extrabold leading-none text-brand">
        {formatPrice(level.price)}
      </p>
      <p className="mt-2 text-sm font-bold text-ink-soft">
        {empty
          ? "Coming soon"
          : `${level.productsCount} surprise product${level.productsCount > 1 ? "s" : ""}`}
      </p>
    </button>
  );
}