import { BadgeCheck, Eye, Lock, RefreshCcw } from "lucide-react";

const ITEMS = [
  { Icon: Eye, text: "Odds shown before you pay" },
  { Icon: BadgeCheck, text: "Prize worth your price or more" },
  { Icon: RefreshCcw, text: "Damaged or wrong item? We replace it" },
  { Icon: Lock, text: "Secure online payment" },
];

export default function TrustStrip() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-6 md:px-8">
      <div className="grid gap-3 rounded-3xl border-2 border-ink bg-lilac p-4 shadow-[4px_4px_0_var(--color-ink)] sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ Icon, text }) => (
          <div key={text} className="flex items-center gap-2.5 text-sm font-extrabold">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-cream">
              <Icon size={18} strokeWidth={2.8} className="text-violet-dark" />
            </span>
            {text}
          </div>
        ))}
      </div>
    </section>
  );
}