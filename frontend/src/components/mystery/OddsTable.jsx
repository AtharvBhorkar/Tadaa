import { formatPrice } from "../../utils/formatPrice";

export default function OddsTable({ level }) {
  return (
    <div className="overflow-hidden rounded-3xl border-2 border-ink bg-cream shadow-[4px_4px_0_var(--color-ink)]">
      <div className="border-b-2 border-ink bg-sun px-4 py-2 font-display text-lg font-extrabold">
        {level.name} odds
      </div>
      <ul>
        {level.prizes.map((p) => (
          <li
            key={p.productId}
            className="flex items-center gap-3 border-b border-[#F2B1A8]/60 px-4 py-3 last:border-b-0"
          >
            {p.image ? (
              <img src={p.image} alt="" className="h-12 w-12 rounded-lg border-2 border-ink/20 object-cover" />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-peach" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold">{p.title}</p>
              <p className="text-xs font-bold text-ink-soft">Value {formatPrice(p.value)}</p>
              <div className="mt-1 h-2 overflow-hidden rounded-full border border-ink/30 bg-peach">
                <div className="h-full bg-violet" style={{ width: `${Math.min(p.chance, 100)}%` }} />
              </div>
            </div>
            <span className="w-14 text-right font-display text-lg font-extrabold text-brand">
              {p.chance}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}