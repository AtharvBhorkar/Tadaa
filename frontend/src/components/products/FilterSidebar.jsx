import {
  Droplet,
  Gamepad2,
  Headphones,
  IndianRupee,
  LayoutGrid,
  Pencil,
  RotateCcw,
  Shirt,
  Sprout,
  Watch,
} from "lucide-react";

const CATEGORIES = [
  { label: "All Products", value: "", Icon: LayoutGrid },
  { label: "Gadgets", value: "Gadgets", Icon: Headphones },
  { label: "Fashion", value: "Fashion", Icon: Shirt },
  { label: "Home & Decor", value: "Home & Decor", Icon: Sprout },
  { label: "Beauty & Personal Care", value: "Beauty & Personal Care", Icon: Droplet },
  { label: "Accessories", value: "Accessories", Icon: Watch },
  { label: "Stationery", value: "Stationery", Icon: Pencil },
  { label: "Toys & Games", value: "Toys & Games", Icon: Gamepad2 },
];

const SORTS = [
  { value: "popular", label: "Popular" },
  { value: "new", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
];

const MAX_PRICE = 5000;
const fieldClass =
  "w-full rounded-xl border-2 border-ink/30 bg-cream px-3 py-2 text-sm font-extrabold outline-none focus:border-violet";

export default function FilterSidebar({
  category,
  onCategory,
  priceInput,
  onPriceInput,
  sort,
  onSort,
  onClear,
}) {
  return (
    <aside className="h-fit rounded-3xl border-2 border-[#F2B1A8] bg-cream p-4 shadow-[0_6px_16px_rgba(185,52,40,0.1)] lg:sticky lg:top-24">
      <h2 className="mb-2 flex items-center gap-2 font-display text-xl font-extrabold">
        <LayoutGrid size={20} strokeWidth={2.8} /> Categories
      </h2>

      <ul className="space-y-1">
        {CATEGORIES.map(({ label, value, Icon }) => {
          const active = category === value;
          return (
            <li key={label}>
              <button
                type="button"
                onClick={() => onCategory(value)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-extrabold transition ${
                  active ? "bg-lilac text-violet-dark" : "hover:bg-peach"
                }`}
              >
                <Icon size={18} strokeWidth={2.6} className={active ? "text-violet" : "text-brand"} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 border-t-2 border-coral/40 pt-4">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-extrabold">
          <IndianRupee size={18} strokeWidth={2.8} /> Price Range
        </h3>
        <input
          type="range"
          min={0}
          max={MAX_PRICE}
          step={50}
          value={priceInput.max === "" ? MAX_PRICE : priceInput.max}
          onChange={(e) =>
            onPriceInput({
              ...priceInput,
              max: Number(e.target.value) >= MAX_PRICE ? "" : e.target.value,
            })
          }
          className="w-full accent-violet"
        />
        <div className="mt-2 grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="₹0"
            value={priceInput.min}
            onChange={(e) => onPriceInput({ ...priceInput, min: e.target.value })}
            className={fieldClass}
          />
          <input
            type="number"
            min={0}
            placeholder={`₹${MAX_PRICE.toLocaleString("en-IN")}`}
            value={priceInput.max}
            onChange={(e) => onPriceInput({ ...priceInput, max: e.target.value })}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="mt-4 border-t-2 border-coral/40 pt-4">
        <h3 className="mb-2 font-display text-lg font-extrabold">Sort By</h3>
        <select value={sort} onChange={(e) => onSort(e.target.value)} className={fieldClass}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="mx-auto mt-4 flex items-center gap-2 rounded-full border-2 border-ink bg-cream px-4 py-2 text-sm font-extrabold shadow-[2px_2px_0_var(--color-ink)] transition hover:bg-peach active:translate-y-0.5 active:shadow-none"
      >
        <RotateCcw size={16} strokeWidth={2.8} /> Clear Filters
      </button>
    </aside>
  );
}