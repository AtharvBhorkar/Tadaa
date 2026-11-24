import { Link } from "react-router-dom";
import { Droplet, Gamepad2, Headphones, Pencil, Shirt, Sprout, Watch } from "lucide-react";

const CATEGORIES = [
  { label: "Gadgets", Icon: Headphones },
  { label: "Fashion", Icon: Shirt },
  { label: "Home & Decor", Icon: Sprout },
  { label: "Beauty & Personal Care", Icon: Droplet },
  { label: "Accessories", Icon: Watch },
  { label: "Stationery", Icon: Pencil },
  { label: "Toys & Games", Icon: Gamepad2 },
];

export default function Categories() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
      <h2 className="font-display text-3xl font-extrabold">Shop by category</h2>
      <div className="mt-5 flex flex-wrap gap-3">
        {CATEGORIES.map(({ label, Icon }) => (
          <Link
            key={label}
            to={`/products?category=${encodeURIComponent(label)}`}
            className="flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-2 text-sm font-extrabold shadow-[2px_2px_0_var(--color-ink)] transition hover:bg-sun active:translate-y-0.5 active:shadow-none"
          >
            <Icon size={16} strokeWidth={2.8} /> {label}
          </Link>
        ))}
      </div>
    </section>
  );
}