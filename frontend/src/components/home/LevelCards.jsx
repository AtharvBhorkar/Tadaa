import { Link } from "react-router-dom";
import { Eye, Gift } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";

// TEMPORARY prices. Replace with final pricing / API data later.
const LEVELS = [
  { name: "Level 1", tag: "Starter", price: 149, items: "1 surprise product", bg: "bg-mint" },
  { name: "Level 2", tag: "Popular", price: 249, items: "2 surprise products", bg: "bg-sun" },
  { name: "Level 3", tag: "Premium", price: 399, items: "2 surprise products, best prize pool", bg: "bg-lilac" },
];

export default function LevelCards() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
      <h2 className="font-display text-3xl font-extrabold">Pick your Mystery Box</h2>
      <p className="mt-1 text-sm font-bold text-ink-soft">
        Higher level, better prize pool. You always get value worth your price or more.
      </p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {LEVELS.map((l) => (
          <article
            key={l.name}
            className="flex flex-col rounded-3xl border-2 border-ink bg-cream p-5 shadow-[4px_4px_0_var(--color-ink)] transition hover:-translate-y-1"
          >
            <div className="flex items-center justify-between">
              <span className={`rounded-full border-2 border-ink px-3 py-0.5 text-xs font-extrabold ${l.bg}`}>
                {l.tag}
              </span>
              <Gift className="text-brand" size={26} strokeWidth={2.6} />
            </div>

            <h3 className="mt-4 font-display text-2xl font-extrabold">{l.name}</h3>
            <p className="font-display text-5xl font-extrabold leading-none text-brand">
              {formatPrice(l.price)}
            </p>
            <p className="mt-2 text-sm font-bold text-ink-soft">{l.items}</p>
            <p className="mt-3 flex items-center gap-1.5 text-xs font-extrabold text-ink-soft">
              <Eye size={14} strokeWidth={3} /> Odds shown before you pay
            </p>

            <Link
              to="/mystery"
              className="mt-5 rounded-xl border-2 border-ink bg-violet px-4 py-2.5 text-center font-extrabold text-white shadow-[3px_3px_0_var(--color-ink)] transition hover:bg-violet-dark active:translate-y-0.5 active:shadow-none"
            >
              Open this box
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}