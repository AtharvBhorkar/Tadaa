import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Gift, Sparkles, Star } from "lucide-react";

export default function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="mx-auto grid max-w-[1200px] items-center gap-8 px-4 py-10 md:grid-cols-2 md:px-8 md:py-16">
      <div>
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-sun px-3 py-1 text-xs font-extrabold shadow-[2px_2px_0_var(--color-ink)]">
          <Sparkles size={14} strokeWidth={3} /> Mystery boxes + everyday deals
        </span>

        <h1 className="mt-4 font-display text-6xl font-extrabold leading-none md:text-8xl">
          Tadaa<span className="text-violet">!</span>
        </h1>
        <p className="mt-2 font-display text-2xl font-extrabold text-brand md:text-3xl">
          Open it and see what you get
        </p>
        <p className="mt-3 max-w-md text-base font-bold text-ink-soft">
          Pick a mystery box level, check the odds, and reveal a surprise worth at least what you
          paid.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/mystery"
            className="rounded-xl border-2 border-ink bg-violet px-6 py-3 font-extrabold text-white shadow-[3px_3px_0_var(--color-ink)] transition hover:bg-violet-dark active:translate-y-0.5 active:shadow-none"
          >
            Open a Mystery Box
          </Link>
          <Link
            to="/products"
            className="rounded-xl border-2 border-ink bg-cream px-6 py-3 font-extrabold text-ink shadow-[3px_3px_0_var(--color-ink)] transition hover:bg-sun active:translate-y-0.5 active:shadow-none"
          >
            Shop products
          </Link>
        </div>
      </div>

      <div className="relative mx-auto h-72 w-72 md:h-96 md:w-96" aria-hidden="true">
        <div className="absolute inset-6 rounded-[2.5rem] border-2 border-ink bg-sun shadow-[6px_6px_0_var(--color-ink)]" />
        <motion.div
          animate={reduce ? undefined : { y: [0, -14, 0], rotate: [-4, 4, -4] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-12 grid place-items-center rounded-[2rem] border-2 border-ink bg-violet shadow-[4px_4px_0_var(--color-ink)]"
        >
          <Gift className="h-28 w-28 text-white md:h-36 md:w-36" strokeWidth={2.2} />
        </motion.div>
        <motion.div
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute right-2 top-2"
        >
          <Sparkles className="h-10 w-10 text-brand" strokeWidth={2.6} />
        </motion.div>
        <motion.div
          animate={reduce ? undefined : { scale: [1, 1.25, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-3 left-2"
        >
          <Star className="h-9 w-9 fill-mint text-ink" strokeWidth={2.4} />
        </motion.div>
      </div>
    </section>
  );
}