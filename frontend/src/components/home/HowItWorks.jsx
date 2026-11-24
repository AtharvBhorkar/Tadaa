import { CreditCard, ListChecks, PackageCheck, Sparkles } from "lucide-react";

const STEPS = [
  { Icon: ListChecks, title: "Pick a level", text: "Choose a box and check the odds." },
  { Icon: CreditCard, title: "Pay securely", text: "Pay online. The wheel unlocks after payment is confirmed." },
  { Icon: Sparkles, title: "Spin the wheel", text: "Watch the reveal. Your prize is decided by our server using the shown odds." },
  { Icon: PackageCheck, title: "Get your prize", text: "We ship it to you and track it to your door." },
];

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
      <h2 className="font-display text-3xl font-extrabold">How it works</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map(({ Icon, title, text }, i) => (
          <div
            key={title}
            className="relative rounded-3xl border-2 border-[#F2B1A8] bg-cream p-5 pt-7"
          >
            <span className="absolute -top-3 left-4 grid h-8 w-8 place-items-center rounded-full border-2 border-ink bg-sun font-display text-sm font-extrabold">
              {i + 1}
            </span>
            <Icon className="text-brand" size={30} strokeWidth={2.6} />
            <h3 className="mt-2 font-display text-xl font-extrabold">{title}</h3>
            <p className="mt-1 text-sm font-bold text-ink-soft">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}