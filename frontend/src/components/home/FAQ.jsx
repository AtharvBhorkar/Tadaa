import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is the wheel really random?",
    a: "The wheel is only the reveal animation. The prize is picked by our server using the odds shown on the Mystery page, so what you see is how it works.",
  },
  {
    q: "Will I always get my money's worth?",
    a: "Yes. Every prize is worth at least what you paid for the box, and the odds for each level are shown before you pay.",
  },
  {
    q: "Can I return a mystery item if I don't like it?",
    a: "Mystery items are non-returnable if you simply don't like the prize. You confirm this before paying.",
  },
  {
    q: "What if my item arrives damaged, wrong or missing?",
    a: "Record an unboxing video and take photos, then raise a claim within 48 hours of delivery. We will send a replacement after checking the claim.",
  },
  {
    q: "How much is shipping?",
    a: "A flat shipping fee is charged separately and shown at the start of checkout, so there are no surprises at the end.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "Online payments only (UPI and cards via our payment gateway). Cash on delivery is not available.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="mx-auto max-w-3xl px-4 py-10 md:px-8">
      <h2 className="font-display text-3xl font-extrabold">Questions? Answers.</h2>
      <div className="mt-5 space-y-3">
        {FAQS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className="rounded-2xl border-2 border-ink bg-cream shadow-[3px_3px_0_var(--color-ink)]">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-3 p-4 text-left font-extrabold"
              >
                {f.q}
                <ChevronDown
                  size={20}
                  strokeWidth={3}
                  className={`shrink-0 transition ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              {isOpen && <p className="px-4 pb-4 text-sm font-bold text-ink-soft">{f.a}</p>}
            </div>
          );
        })}
      </div>
    </section>
  );
}